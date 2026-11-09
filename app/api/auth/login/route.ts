import { NextResponse } from 'next/server'
import { createIsolatedClient } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  const supabase = createIsolatedClient(); // never sign in on the shared client
  try {
    const { email, password, userType } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Attempt to sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // For development: allow demo login without actual credentials
      // In production, remove this fallback
      if (process.env.NODE_ENV === 'development') {
        console.warn('Auth error (development mode):', error.message)
        return NextResponse.json({
          success: true,
          message: 'Development mode: auth bypassed',
          userType,
        })
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      userType,
    })
  } catch (error: any) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

