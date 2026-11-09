// Server-only: who is making this request, for the Change Log (activity_logs triggers).
import { createClient } from '@supabase/supabase-js';

export interface Actor {
  id: string | null;
  ip: string | null;
  userAgent: string | null;
}

export function clientIp(h: Headers): string | null {
  const fwd = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return fwd || h.get('x-real-ip')?.trim() || null;
}

/** Headers the activity_logs trigger reads via PostgREST's request.headers. */
export function actorHeaders(a: Partial<Actor> | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (a?.id) out['x-actor-id'] = a.id;
  if (a?.ip) out['x-actor-ip'] = a.ip;
  if (a?.userAgent) out['x-actor-ua'] = a.userAgent.slice(0, 300);
  return out;
}

// Verified token → user id. ponytail: per-instance in-memory cache, 5 min; fine for one school.
const TOKEN_TTL_MS = 5 * 60 * 1000;
const tokenCache = new Map<string, { id: string | null; until: number }>();
let verifier: ReturnType<typeof createClient> | null = null;

async function userIdFromToken(token: string): Promise<string | null> {
  const hit = tokenCache.get(token);
  if (hit && hit.until > Date.now()) return hit.id;
  // Plain client (no audit fetch) so verifying never recurses into getActor()
  verifier ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await verifier.auth.getUser(token);
  const id = data.user?.id ?? null;
  if (tokenCache.size > 500) tokenCache.clear();
  tokenCache.set(token, { id, until: Date.now() + TOKEN_TTL_MS });
  return id;
}

/** The verified caller of the current request, or null outside a request (cron, scripts). */
export async function getActor(): Promise<Actor | null> {
  let h: Headers;
  try {
    const { headers } = await import('next/headers');
    h = new Headers(await headers());
  } catch {
    return null;
  }
  const token = h.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  let id: string | null = null;
  if (token) {
    try {
      id = await userIdFromToken(token);
    } catch {
      id = null; // logging must never break a save
    }
  }
  return { id, ip: clientIp(h), userAgent: h.get('user-agent') };
}

/** fetch for the admin Supabase client: tags database (PostgREST) calls with the actor. */
export const auditFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (!url.includes('/rest/v1/')) return fetch(input, init);
  const extra = actorHeaders(await getActor());
  if (!Object.keys(extra).length) return fetch(input, init);
  const headers = new Headers(init?.headers);
  for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return fetch(input, { ...init, headers });
};
