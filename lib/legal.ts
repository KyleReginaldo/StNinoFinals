// Reads the plain text an admin types for the Terms of Service / Privacy Policy into
// blocks the page can render. Plain text only: nothing here is ever treated as HTML.
//
// Admin format (also shown in Settings):
//   ## Heading            ### Smaller heading
//   - bullet   (or "* ")  1. numbered item
//   blank line = new paragraph; a single line break stays inside the paragraph

export type LegalBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] };

const HEADING = /^(#{2,3})\s+(.*\S)\s*$/;
const BULLET = /^[-*]\s+(.*\S)\s*$/;
const NUMBERED = /^\d+[.)]\s+(.*\S)\s*$/;

export function parseLegal(text: string | null | undefined): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join('\n') });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: 'list', ordered: list.ordered, items: list.items });
    list = null;
  };

  for (const raw of (text ?? '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', level: heading[1].length === 2 ? 2 : 3, text: heading[2] });
      continue;
    }
    const bullet = BULLET.exec(line);
    const numbered = bullet ? null : NUMBERED.exec(line);
    const item = bullet?.[1] ?? numbered?.[1];
    if (item !== undefined) {
      flushParagraph();
      const ordered = !bullet;
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push(item);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

/**
 * Editor buttons ("Heading", "Bullet", "Numbered"): adds `prefix` to the start of every
 * non-empty line touched by the selection, or removes it when they all already have it.
 * A "1. " prefix numbers the lines 1, 2, 3. Returns the new text and selection.
 */
export function prefixLines(
  text: string,
  selStart: number,
  selEnd: number,
  prefix: string
): { text: string; selStart: number; selEnd: number } {
  const from = text.lastIndexOf('\n', Math.max(0, selStart) - 1) + 1;
  const toIdx = text.indexOf('\n', selEnd);
  const to = toIdx === -1 ? text.length : toIdx;

  const numbered = /^\d+\.\s$/.test(prefix);
  const strip = numbered ? /^\d+\.\s/ : null;
  const lines = text.slice(from, to).split('\n');
  const content = lines.filter((l) => l.trim());
  const allHave = content.length > 0 && content.every((l) => (strip ? strip.test(l) : l.startsWith(prefix)));

  let n = 0;
  const out = lines.map((l) => {
    if (!l.trim()) return l;
    if (allHave) return strip ? l.replace(strip, '') : l.slice(prefix.length);
    n += 1;
    if (numbered) return `${n}. ${l.replace(strip!, '')}`; // renumber, never "1. 1. x"
    return l.startsWith(prefix) ? l : prefix + l; // already has it: leave alone
  });

  const replaced = out.join('\n');
  const delta = replaced.length - (to - from);
  const firstDelta = out[0].length - lines[0].length;
  return {
    text: text.slice(0, from) + replaced + text.slice(to),
    selStart: selStart + (lines[0].trim() ? firstDelta : 0),
    selEnd: selEnd + delta,
  };
}
