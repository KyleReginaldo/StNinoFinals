import { describe, expect, it } from 'vitest';
import { describeRecord, diffChanges } from '../lib/activity-log';

describe('diffChanges', () => {
  it('update: only changed fields, ignoring timestamps', () => {
    expect(
      diffChanges(
        { id: '1', section: 'Rizal', grade_level: 'Grade 1', updated_at: 'a' },
        { id: '1', section: 'Bonifacio', grade_level: 'Grade 1', updated_at: 'b' }
      )
    ).toEqual([{ field: 'section', from: 'Rizal', to: 'Bonifacio' }]);
  });
  it('insert: every field that has a value', () => {
    expect(diffChanges(null, { id: '1', name: 'Rizal', strand: null, created_at: 'x' })).toEqual([
      { field: 'name', from: null, to: 'Rizal' },
    ]);
  });
  it('delete: every field that had a value', () => {
    expect(diffChanges({ id: '1', name: 'Rizal' }, null)).toEqual([{ field: 'name', from: 'Rizal', to: null }]);
  });
  it('compares objects/arrays by value', () => {
    expect(diffChanges({ schedule: [{ d: 'M' }] }, { schedule: [{ d: 'M' }] })).toEqual([]);
  });
});

describe('describeRecord', () => {
  it('uses the most human name available', () => {
    expect(describeRecord('users', { first_name: 'Juan', last_name: 'Cruz', id: 'x' })).toBe('Juan Cruz');
    expect(describeRecord('classes', { class_name: 'Math 1', id: 'x' })).toBe('Math 1');
    expect(describeRecord('sections', { name: 'Rizal', grade_level: 'Grade 1' })).toBe('Rizal (Grade 1)');
    expect(describeRecord('announcements', { title: 'PTA' })).toBe('PTA');
    expect(describeRecord('grades', { id: 'abc' })).toBe('abc');
  });
});
