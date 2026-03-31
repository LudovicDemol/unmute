import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (user) {
    const metadata = user.user_metadata as Record<string, unknown>
    const hasAcademicInfo = metadata?.firstname && metadata?.lastname && metadata?.faculty && metadata?.year
    if (!hasAcademicInfo) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return NextResponse.redirect(new URL('/scenarios', request.url))
}
