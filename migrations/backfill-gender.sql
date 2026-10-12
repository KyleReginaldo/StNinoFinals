-- Backfill users.gender for students, teachers and parents.
--
-- Gender cannot be known for certain from existing data, so this goes from
-- exact to best guess. Run each STEP separately in the Supabase SQL editor and
-- read its output before moving on. Every UPDATE only touches rows whose gender
-- is still NULL, so re-running is safe and never overwrites a value an admin set.
--
-- Afterwards, fix anything left (or guessed wrong) with the Gender drop-down in
-- the admin Students / Teachers / Parents tables: it saves on change, and
-- sorting by Gender groups the blanks together.

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 0. Where things stand
-- ════════════════════════════════════════════════════════════════════════════
SELECT role, COALESCE(gender, '(blank)') AS gender, count(*)
FROM users
WHERE role IN ('student', 'teacher', 'parent')
GROUP BY role, gender
ORDER BY role, gender;

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 1. Normalize existing values to exactly 'Male' / 'Female'
-- ════════════════════════════════════════════════════════════════════════════
UPDATE users SET gender = 'Male'   WHERE lower(trim(gender)) IN ('m', 'male')   AND gender <> 'Male';
UPDATE users SET gender = 'Female' WHERE lower(trim(gender)) IN ('f', 'female') AND gender <> 'Female';
-- Anything else ('unspecified', '', typos) becomes blank so later steps fill it
UPDATE users SET gender = NULL WHERE gender IS NOT NULL AND gender NOT IN ('Male', 'Female');

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 2. Guardians: exact, from their relationship to a linked student
--         (user_relationships.user_id is the parent). A guardian linked as
--         'father' to one child and 'mother' to another is skipped.
-- ════════════════════════════════════════════════════════════════════════════
UPDATE users u
SET gender = r.gender
FROM (
  SELECT user_id, min(g) AS gender
  FROM (
    SELECT user_id,
           CASE
             WHEN lower(relationship_type) IN ('father', 'uncle', 'grandfather', 'brother', 'stepfather') THEN 'Male'
             WHEN lower(relationship_type) IN ('mother', 'aunt', 'grandmother', 'sister', 'stepmother') THEN 'Female'
           END AS g
    FROM user_relationships
  ) t
  WHERE g IS NOT NULL
  GROUP BY user_id
  HAVING count(DISTINCT g) = 1
) r
WHERE u.id = r.user_id
  AND u.role = 'parent'
  AND u.gender IS NULL;

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 3. Everyone else: best guess from the first given name, using common
--         Filipino names. Names used for both genders (Angel, Jan, Kim, Jamie,
--         Alex, Shane, Jessie, Jordan, ...) are deliberately not listed and
--         stay blank. Compound names use the first word: "John Paul" → john,
--         "Ma. Theresa" → ma.
--
--         3a creates the lookup table, 3b previews, 3c applies, 3d cleans up.
-- ════════════════════════════════════════════════════════════════════════════

-- 3a. Lookup table (a real table, so the preview and apply can be separate runs)
CREATE TABLE IF NOT EXISTS tmp_gender_names (name TEXT PRIMARY KEY, gender TEXT NOT NULL);

INSERT INTO tmp_gender_names (name, gender)
SELECT n, 'Male' FROM unnest(ARRAY[
  'aaron','adrian','aldrin','alfred','allan','alvin','andrei','andres','andrew','angelo','anthony','antonio',
  'archie','arnel','arnold','arthur','axel','benedict','benjamin','bernard','bienvenido','bryan','brian','bryle',
  'carl','carlo','carlos','cedric','charles','christian','christopher','clarence','clark','daniel','danilo','darwin',
  'david','dennis','dominic','edgar','edison','eduardo','edward','edwin','elijah','emmanuel','enrico','enrique',
  'eric','erwin','ethan','eugene','felix','ferdinand','fernando','francis','francisco','frederick','gabriel','gerald',
  'gilbert','gino','glenn','gregorio','harold','henry','ian','isaac','ivan','jacob','jaime','james','jason','jay',
  'jayson','jaypee','jeffrey','jerome','jerry','jesus','jhon','jhun','joel','john','johnny','jomar','jonathan',
  'jose','joseph','joshua','juan','julius','jun','justin','karl','kenneth','ken','kevin','kurt','kyle','lance',
  'lawrence','leo','leonardo','lester','louie','luis','manuel','marc','marco','mario','mark','marlon','martin',
  'marvin','matthew','michael','miguel','mike','nathan','nathaniel','neil','nelson','nicholas','noel','oliver',
  'oscar','patrick','paolo','paul','pedro','peter','philip','rafael','ralph','ramon','randy','raphael','raymond',
  'renz','rey','reynaldo','ricardo','richard','rico','robert','roberto','rodel','rodrigo','rogelio','roland',
  'romeo','ronald','ronnie','ruel','ryan','salvador','samuel','sean','sebastian','stephen','steven','teodoro',
  'timothy','tristan','vincent','virgilio','wilfredo','william','zachary'
]) AS n
UNION ALL
SELECT n, 'Female' FROM unnest(ARRAY[
  'abigail','ailyn','aileen','aira','alexa','alma','althea','alyssa','amelia','ana','andrea','angela','angelica',
  'angelie','angeline','anna','anne','annie','april','arlene','ashley','audrey','bea','beatrice','bernadette',
  'carla','carmela','carmen','carol','catherine','cecilia','charlene','charmaine','cherry','christine','claire',
  'clarissa','cristina','cynthia','daisy','danica','daphne','diana','divina','donna','dorothy','elaine','elena',
  'elizabeth','ella','ellen','eloisa','emily','erica','erika','estrella','esther','eunice','evelyn','faith',
  'fatima','flordeliza','florence','frances','gemma','gina','gladys','glenda','gloria','grace','hannah','hazel',
  'helen','irene','isabel','isabella','ivy','jane','janet','janice','janine','jasmine','jeanette','jenny',
  'jennifer','jessa','jessica','joan','joanna','jocelyn','josephine','joy','joyce','judith','julia','julie',
  'juliet','karen','katherine','kathleen','kathryn','katrina','kimberly','kristine','kristina','lara','laura',
  'lea','leah','leizel','liezel','lily','lorna','lorraine','lourdes','lovely','lucia','lyka','lynn','ma','ma.',
  'maria','mariel','marilyn','marissa','maricel','maricar','marites','martha','mary','maureen','melanie','melissa',
  'merly','michelle','mikaela','monica','myla','nancy','natalie','nicole','nina','norma','olivia','pamela',
  'patricia','pauline','precious','princess','rachel','rebecca','regina','rhea','rica','rizza','rosa','rosalie',
  'rose','rosemarie','ruby','ruth','sandra','sarah','sharon','sheila','shiela','sofia','sophia','stephanie','susan',
  'teresa','theresa','trisha','valerie','vanessa','veronica','victoria','vilma','wendy','yvonne','zenaida'
]) AS n
ON CONFLICT (name) DO NOTHING;

-- 3b. PREVIEW: who would be filled, and with what. Read through it; any name
--     here that is wrong for your school can be removed with
--     DELETE FROM tmp_gender_names WHERE name = '...';
SELECT u.role, u.student_number, u.first_name, u.last_name, g.gender AS guessed
FROM users u
JOIN tmp_gender_names g ON g.name = lower(split_part(trim(u.first_name), ' ', 1))
WHERE u.gender IS NULL
  AND u.role IN ('student', 'teacher', 'parent')
ORDER BY g.gender, u.first_name;

-- 3c. APPLY the guesses
UPDATE users u
SET gender = g.gender
FROM tmp_gender_names g
WHERE g.name = lower(split_part(trim(u.first_name), ' ', 1))
  AND u.gender IS NULL
  AND u.role IN ('student', 'teacher', 'parent');

-- 3d. Clean up
DROP TABLE IF EXISTS tmp_gender_names;

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 4. Whoever is still blank. Fix these with the Gender drop-down in the
--         admin tables, or with the template in STEP 5.
-- ════════════════════════════════════════════════════════════════════════════
SELECT role, student_number, email, first_name, last_name
FROM users
WHERE gender IS NULL
  AND role IN ('student', 'teacher', 'parent')
ORDER BY role, last_name, first_name;

-- ════════════════════════════════════════════════════════════════════════════
-- STEP 5 (optional). Set many at once from a list, e.g. copied out of a
--         spreadsheet. Matches on email (every role has one). Replace the
--         example rows; 'Male' / 'Female' only. This one DOES overwrite, so it
--         can also correct wrong guesses.
-- ════════════════════════════════════════════════════════════════════════════
-- UPDATE users u
-- SET gender = v.gender
-- FROM (VALUES
--   ('juan.delacruz@example.com', 'Male'),
--   ('maria.santos@example.com',  'Female')
-- ) AS v(email, gender)
-- WHERE lower(u.email) = lower(v.email)
--   AND v.gender IN ('Male', 'Female');
