import { describe, expect, it } from 'vitest';
import { isValidLrn, lrnEditError, lrnError } from '../lib/lrn';

describe('LRN rules', () => {
  it('is optional only for Kinder', () => {
    expect(lrnError('', 'Kinder')).toBeNull();
    expect(lrnError(null, 'kindergarten')).toBeNull();
    expect(lrnError('', 'Grade 1')).toBe('LRN is required');
    expect(lrnError('  ', null)).toBe('LRN is required');
  });

  it('must be exactly 12 digits when given', () => {
    expect(lrnError('12345678901', 'Kinder')).toBe('LRN must be exactly 12 digits');
    expect(lrnError('1234567890ab', 'Grade 2')).toBe('LRN must be exactly 12 digits');
    expect(lrnError('123456789012', 'Grade 3')).toBeNull();
    expect(lrnError(' 123456789012 ', 'Grade 3')).toBeNull();
    expect(isValidLrn('123456789012')).toBe(true);
    expect(isValidLrn('1234567890123')).toBe(false);
  });
});

describe('lrnEditError (editing an existing student)', () => {
  it('does not block edits when the saved LRN is left unchanged, even if it is an old short number', () => {
    expect(lrnEditError('443', '443', 'Grade 1')).toBeNull();
    expect(lrnEditError('', null, 'Grade 3')).toBeNull();
  });
  it('validates a changed LRN normally', () => {
    expect(lrnEditError('4431', '443', 'Grade 1')).toBe('LRN must be exactly 12 digits');
    expect(lrnEditError('', '443', 'Grade 1')).toBe('LRN is required');
    expect(lrnEditError('123456789012', '443', 'Grade 1')).toBeNull();
  });
});
