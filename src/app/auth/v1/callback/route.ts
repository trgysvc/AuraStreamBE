import { NextResponse } from 'next/server'
import { createClient } from '@/lib/db/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Determine the correct origin based on request headers (especially when behind a proxy)
  let host = request.headers.get('host')

  // Sanitize host: Strip internal port 3000 if present
  // But keep it for local development
  if (host && host.includes(':3000') && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    host = host.split(':')[0]
  }

  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  const origin = host ? `${protocol}://${host}` : new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
