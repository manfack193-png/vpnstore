// app/api/auth/login/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { signToken, comparePassword } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { email, password } = await req.json()
  const { data: user } = await supabaseAdmin.from('users').select('*').eq('email', email).single()
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  const valid = await comparePassword(password, user.password)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  const token = await signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
  const cookieStore = await cookies()
  cookieStore.set('session', token, { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
  return NextResponse.json({ id: user.id, email: user.email, role: user.role, name: user.name })
}
