import { parseLegal } from '@/lib/legal';

/**
 * Shows the admin-editable Terms / Privacy text (see lib/legal.ts for the format).
 * Used everywhere the policies appear: the /terms and /privacy pages, the
 * "I agree" pop-up, and the live preview in Admin › Settings — so they always match.
 * Plain React text only; never dangerouslySetInnerHTML.
 */
export function LegalContent({ text }: { text: string }) {
  return (
    <>
      {parseLegal(text).map((block, i) => {
        switch (block.type) {
          case 'heading':
            return block.level === 2 ? (
              <h2 key={i} className="text-base font-bold text-gray-800 mb-2 mt-8 first:mt-0">
                {block.text}
              </h2>
            ) : (
              <h3 key={i} className="text-sm font-semibold text-gray-800 mb-1.5 mt-5 first:mt-0">
                {block.text}
              </h3>
            );
          case 'list': {
            const Tag = block.ordered ? 'ol' : 'ul';
            return (
              <Tag
                key={i}
                className={`${block.ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1 mb-4`}
              >
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </Tag>
            );
          }
          default:
            return (
              <p key={i} className="whitespace-pre-line mb-4 last:mb-0">
                {block.text}
              </p>
            );
        }
      })}
    </>
  );
}
