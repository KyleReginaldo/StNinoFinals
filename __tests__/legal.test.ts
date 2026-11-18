import { describe, expect, it } from 'vitest';
import { parseLegal, prefixLines } from '../lib/legal';

describe('parseLegal', () => {
  it('heading with its paragraph directly underneath (no blank line) stays a heading + paragraph', () => {
    expect(parseLegal('## 1. Acceptance\nBy using the portal you agree to these terms.')).toEqual([
      { type: 'heading', level: 2, text: '1. Acceptance' },
      { type: 'paragraph', text: 'By using the portal you agree to these terms.' },
    ]);
  });

  it('blank lines separate paragraphs; single line breaks stay inside one paragraph', () => {
    expect(parseLegal('First line\nsecond line\n\nNext paragraph')).toEqual([
      { type: 'paragraph', text: 'First line\nsecond line' },
      { type: 'paragraph', text: 'Next paragraph' },
    ]);
  });

  it('bullets ("- " or "* ") group into one list, even right after a paragraph', () => {
    expect(parseLegal('You must:\n- keep your password private\n* log out on shared computers')).toEqual([
      { type: 'paragraph', text: 'You must:' },
      { type: 'list', ordered: false, items: ['keep your password private', 'log out on shared computers'] },
    ]);
  });

  it('numbered lines "1. text" become an ordered list', () => {
    expect(parseLegal('1. First\n2. Second')).toEqual([
      { type: 'list', ordered: true, items: ['First', 'Second'] },
    ]);
  });

  it('### is a smaller heading; Windows line endings and extra blank lines are fine', () => {
    expect(parseLegal('## Big\r\n\r\n\r\n### Small\r\ntext')).toEqual([
      { type: 'heading', level: 2, text: 'Big' },
      { type: 'heading', level: 3, text: 'Small' },
      { type: 'paragraph', text: 'text' },
    ]);
  });

  it('never treats text as HTML: it is returned as plain strings', () => {
    expect(parseLegal('<script>alert(1)</script>')).toEqual([{ type: 'paragraph', text: '<script>alert(1)</script>' }]);
  });

  it('empty or blank input gives no blocks', () => {
    expect(parseLegal('')).toEqual([]);
    expect(parseLegal('  \n\n ')).toEqual([]);
    expect(parseLegal(null)).toEqual([]);
  });
});

describe('prefixLines (editor buttons)', () => {
  it('adds the prefix to the line the cursor is on', () => {
    const r = prefixLines('Intro\nAcceptance of terms\nMore', 8, 8, '## ');
    expect(r.text).toBe('Intro\n## Acceptance of terms\nMore');
  });
  it('adds it to every non-empty line in the selection', () => {
    const t = 'one\ntwo\n\nthree';
    const r = prefixLines(t, 0, t.length, '- ');
    expect(r.text).toBe('- one\n- two\n\n- three');
  });
  it('pressing it again on prefixed lines removes the prefix', () => {
    const r = prefixLines('- one\n- two', 0, 11, '- ');
    expect(r.text).toBe('one\ntwo');
  });
  it('keeps the selection around the same words', () => {
    const r = prefixLines('Acceptance', 0, 10, '## ');
    expect(r.text).toBe('## Acceptance');
    expect(r.text.slice(r.selStart, r.selEnd)).toBe('Acceptance');
  });
  it('a mixed selection does not double up lines that already have the marker', () => {
    const t = '- already\nplain\n- also already';
    expect(prefixLines(t, 0, t.length, '- ').text).toBe('- already\n- plain\n- also already');
  });
  it('renumbers cleanly when some lines were already numbered', () => {
    const t = '1. a\nb\n3. c';
    expect(prefixLines(t, 0, t.length, '1. ').text).toBe('1. a\n2. b\n3. c');
  });
  it('numbered lines count 1, 2, 3', () => {
    const r = prefixLines('a\nb\nc', 0, 5, '1. ');
    expect(r.text).toBe('1. a\n2. b\n3. c');
  });
});
