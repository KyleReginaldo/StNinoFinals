import { describe, expect, it } from 'vitest';
import { actorHeaders, clientIp, looksLikeJwt } from '../lib/audit';

describe('clientIp', () => {
  it('takes the first x-forwarded-for entry', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4');
  });
  it('falls back to x-real-ip, else null', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8');
    expect(clientIp(new Headers())).toBeNull();
  });
});

describe('actorHeaders', () => {
  it('only includes values that are present', () => {
    expect(actorHeaders({ id: 'u1', ip: null, userAgent: '' })).toEqual({ 'x-actor-id': 'u1' });
    expect(actorHeaders(null)).toEqual({});
  });
});

describe('looksLikeJwt', () => {
  it('only treats Supabase-style JWTs as login tokens (cron secrets are skipped)', () => {
    expect(looksLikeJwt('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig')).toBe(true);
    expect(looksLikeJwt('my-cron-secret')).toBe(false);
    expect(looksLikeJwt('abc.def.ghi')).toBe(false);
  });
});
