'use client';

import { useCallback, useEffect, useState } from 'react';

export interface LegalContentState {
  terms: string;
  privacy: string;
  status: 'loading' | 'ready' | 'error';
  reload: () => void;
}

/** The current Terms of Service / Privacy Policy text (edited by the admin in Settings). */
export function useLegalContent(enabled = true): LegalContentState {
  const [data, setData] = useState<{ terms: string; privacy: string } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled || data) return;
    let ignore = false;
    setStatus('loading');
    fetch('/api/legal', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (ignore) return;
        if (!d?.success) throw new Error('bad response');
        setData({ terms: d.terms, privacy: d.privacy });
        setStatus('ready');
      })
      .catch(() => !ignore && setStatus('error'));
    return () => {
      ignore = true;
    };
  }, [enabled, data, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { terms: data?.terms ?? '', privacy: data?.privacy ?? '', status, reload };
}
