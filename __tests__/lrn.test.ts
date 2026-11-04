import { describe, expect, it } from 'vitest';
import { isValidLrn, lrnError } from '../lib/lrn';

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
