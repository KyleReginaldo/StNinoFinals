'use client';

import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

/**
 * Adds the signed-in user's Supabase token to every same-origin /api/ call, so the
 * server can verify who made a change (used by the Change Log). One wrapper here
 * instead of touching every fetch() in the app.
 */
export function AuthTokenFetch() {
  useEffect(() => {
    const w = window as typeof window & { __authFetchPatched?: boolean };
    if (w.__authFetchPatched) return;
    w.__authFetchPatched = true;
    const original = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const sameOriginApi = url.startsWith('/api/') || url.startsWith(`${location.origin}/api/`);
      if (!sameOriginApi) return original(input, init);

      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      if (!headers.has('Authorization')) {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) headers.set('Authorization', `Bearer ${token}`);
      }
      return original(input, { ...init, headers });
    };
  }, []);

  return null;
}
