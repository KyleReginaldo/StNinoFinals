import { DEFAULT_PRIVACY_CONTENT, DEFAULT_TERMS_CONTENT } from '@/lib/legal-defaults';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

// Public: the current Terms of Service and Privacy Policy text and nothing else
// (the admin edits them in Settings). Used by /terms, /privacy and the "I agree" pop-up.
export async function GET() {
  let terms = '';
  let privacy = '';
  try {
    const { data } = await getSupabaseAdmin()
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['termsContent', 'privacyContent']);
    for (const row of data ?? []) {
      if (row.setting_key === 'termsContent') terms = row.setting_value ?? '';
      if (row.setting_key === 'privacyContent') privacy = row.setting_value ?? '';
    }
  } catch (error) {
    console.error('Error loading legal content:', error);
  }
  return NextResponse.json(
    { success: true, terms: terms.trim() || DEFAULT_TERMS_CONTENT, privacy: privacy.trim() || DEFAULT_PRIVACY_CONTENT },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
