'use client';

import { LegalContent } from '@/components/LegalContent';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { prefixLines } from '@/lib/legal';
import { useConfirm } from '@/lib/use-confirm';
import { ExternalLink, List, ListOrdered, RotateCcw, Heading2 } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

/**
 * Editor for one policy document (Terms of Service or Privacy Policy).
 * The preview uses the same renderer as the public page and the "I agree" pop-up,
 * so what the admin sees here is what visitors see.
 */
export function LegalEditor({
  id,
  label,
  value,
  onChange,
  defaultValue,
  publicHref,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  defaultValue: string;
  publicHref: string;
}) {
  const { showConfirm } = useConfirm();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const ref = useRef<HTMLTextAreaElement>(null);

  const apply = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const next = prefixLines(value, el.selectionStart, el.selectionEnd, prefix);
    onChange(next.text);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(next.selStart, next.selEnd);
    });
  };

  const reset = async () => {
    const ok = await showConfirm({
      message: `Replace the ${label} text with the original default? Your edits will be lost unless you leave this page without saving.`,
      confirmText: 'Use default',
      cancelText: 'Keep my text',
      variant: 'destructive',
    });
    if (ok) onChange(defaultValue);
  };

  const tab = (m: 'edit' | 'preview', text: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
        mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
      }`}
    >
      {text}
    </button>
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-auto">
          {label}
        </label>
        <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
          {tab('edit', 'Edit')}
          {tab('preview', 'Preview')}
        </div>
        <Link
          href={publicHref}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
        >
          <ExternalLink className="w-3 h-3" /> Public page
        </Link>
      </div>

      {mode === 'edit' ? (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => apply('## ')} title="Make the selected line a heading">
              <Heading2 className="w-3.5 h-3.5 mr-1" /> Heading
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => apply('- ')} title="Turn the selected lines into bullets">
              <List className="w-3.5 h-3.5 mr-1" /> Bullets
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => apply('1. ')} title="Number the selected lines">
              <ListOrdered className="w-3.5 h-3.5 mr-1" /> Numbered
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs ml-auto text-gray-500" onClick={reset}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset to default
            </Button>
          </div>
          <Textarea
            id={id}
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={14}
            className="font-mono text-xs resize-y"
          />
          <p className="text-xs text-gray-400">
            Select lines, then press a button. Leave a blank line between paragraphs. Use Preview to see how it looks. Saving an empty box restores the default.
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600 leading-relaxed max-h-[28rem] overflow-y-auto">
          {value.trim() ? (
            <LegalContent text={value} />
          ) : (
            <p className="text-gray-400">Empty. The default text will be shown after you save.</p>
          )}
        </div>
      )}
    </div>
  );
}
