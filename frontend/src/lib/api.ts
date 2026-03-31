import { supabase } from '@/lib/supabase'

const API_BASE = process.env.NEXT_PUBLIC_URL_API_ECOS!

export async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 8000
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        ...options.headers,
      },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.error ?? `HTTP ${res.status}`)
    }

    return res.json()
  } finally {
    clearTimeout(timeoutId)
  }
}