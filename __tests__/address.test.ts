import { describe, expect, it } from 'vitest';
import { composeTreceAddress, formatAddress, missingAddressFields, normalizeAddress } from '../lib/address';

describe('address helpers', () => {
  const full = { street: 'Blk 23 Lt 20 Pacific Town', barangay: 'Luciano', city: 'Trece Martires City', province: 'Cavite' };

  it('formats all parts in order', () => {
    expect(formatAddress(full)).toBe('Blk 23 Lt 20 Pacific Town, Brgy. Luciano, Trece Martires City, Cavite');
  });

  it('skips blank parts', () => {
    expect(formatAddress({ ...full, street: ' ', barangay: '' })).toBe('Trece Martires City, Cavite');
  });

  it('lists missing fields, treating whitespace as blank', () => {
    expect(missingAddressFields(full)).toEqual([]);
    expect(missingAddressFields({ ...full, city: '  ' })).toEqual(['City/Municipality']);
    expect(missingAddressFields(undefined)).toHaveLength(4);
  });
});

describe('normalizeAddress', () => {
  it('trims strings and blanks out non-strings', () => {
    expect(normalizeAddress({ street: ' 1 Main ', barangay: 5, city: null })).toEqual({
      street: '1 Main',
      barangay: '',
      city: '',
      province: '',
    });
    expect(normalizeAddress(undefined)).toEqual({ street: '', barangay: '', city: '', province: '' });
  });
});

describe('composeTreceAddress', () => {
  it('composes when a barangay is picked', () => {
    expect(composeTreceAddress({ barangay: '1', barangayName: 'San Agustin', streetDetails: ' Blk 1 ' }, 'old'))
      .toBe('Blk 1, San Agustin, Trece Martires City, Cavite');
  });
  it('keeps the saved address when no barangay was picked (e.g. admission-created record)', () => {
    expect(composeTreceAddress({ barangay: '', barangayName: '', streetDetails: 'Blk 2' }, '12 Rizal St, Brgy. X, Dasmariñas, Cavite'))
      .toBe('12 Rizal St, Brgy. X, Dasmariñas, Cavite');
  });
});
