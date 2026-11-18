import { readFileSync } from 'node:fs';
for (const l of readFileSync('.env.local','utf8').replace(/^﻿/,'').split(/\r?\n/)) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^"|"$/g,''); }
const db = (await import('@supabase/supabase-js')).createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await db.from('sections').select('name, grade_level, school_year, max_capacity').gt('max_capacity', 60);
console.log(error ? error.message : `sections over 60: ${data.length}`, JSON.stringify(data));
