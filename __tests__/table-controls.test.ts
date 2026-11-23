import { describe, expect, it } from 'vitest';
import { pinFirst } from '../hooks/use-table-controls';

describe('pinFirst', () => {
  const rows = [{ n: 'a' }, { n: 'b' }, { n: 'c' }, { n: 'd' }, { n: 'e' }];

  it('moves the pinned rows to the top and keeps the existing order inside each group', () => {
    expect(pinFirst(rows, (r) => r.n === 'c' || r.n === 'e').map((r) => r.n)).toEqual(['c', 'e', 'a', 'b', 'd']);
  });

  it('does nothing without a rule, or when nothing matches', () => {
    expect(pinFirst(rows).map((r) => r.n)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(pinFirst(rows, () => false).map((r) => r.n)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('does not change the original array', () => {
    pinFirst(rows, (r) => r.n === 'e');
    expect(rows.map((r) => r.n)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
