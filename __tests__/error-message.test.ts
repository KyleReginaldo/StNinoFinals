import { describe, expect, it } from 'vitest';
import { friendlyError, subjectSaveError } from '../lib/error-message';

const FALLBACK = 'We could not submit your enrollment request. Please try again in a moment.';

describe('friendlyError', () => {
  it('never leaks raw Postgres text', () => {
    const pg = {
      code: '23503',
      message:
        'insert or update on table "enrollment_requests" violates foreign key constraint "enrollment_requests_student_id_fkey"',
    };
    const out = friendlyError(pg, FALLBACK);
    expect(out).not.toMatch(/constraint|violates|fkey/i);
    expect(out).toMatch(/refresh the page/i);
  });

  it('maps a stale schema cache to a pending database update', () => {
    const out = friendlyError(
      { code: 'PGRST204', message: "Could not find the 'address' column of 'admissions' in the schema cache" },
      FALLBACK
    );
    expect(out).toMatch(/database update/i);
    expect(out).not.toMatch(/schema cache/i);
  });

  it('recognises a dropped connection', () => {
    expect(friendlyError(new TypeError('Failed to fetch'), FALLBACK)).toMatch(
      /internet connection/i
    );
  });

  it('turns an RLS denial into a permission message', () => {
    expect(
      friendlyError({ message: 'new row violates row-level security policy' }, FALLBACK)
    ).toMatch(/permission/i);
  });

  it('falls back for anything it does not recognise', () => {
    expect(friendlyError(new Error('kaboom'), FALLBACK)).toBe(FALLBACK);
    expect(friendlyError(null, FALLBACK)).toBe(FALLBACK);
    expect(friendlyError(undefined, FALLBACK)).toBe(FALLBACK);
  });
});

describe('subjectSaveError', () => {
  const FALL = 'We could not create this subject.';
  it('explains the old database rule instead of "This record already exists"', () => {
    const e = { code: '23505', message: 'duplicate key value violates unique constraint "classes_class_code_key"', details: 'Key (class_code)=(MATH7) already exists.' };
    const msg = subjectSaveError(e, FALL);
    expect(msg).toContain('same subject code');
    expect(msg).toContain('allow-duplicate-subject-codes.sql');
    expect(msg).not.toMatch(/already exists/i);
  });
  it('other errors still go through friendlyError', () => {
    expect(subjectSaveError({ code: '23503', message: 'x' }, FALL)).toBe(friendlyError({ code: '23503', message: 'x' }, FALL));
    expect(subjectSaveError({ code: '23505', message: 'duplicate key value violates unique constraint "classes_pkey"' }, FALL)).toBe('This record already exists.');
    expect(subjectSaveError(null, FALL)).toBe(FALL);
  });
});
