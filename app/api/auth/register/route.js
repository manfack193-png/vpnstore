import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { name, email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const { data: exists } = await supabaseAdmin.from('users').select('id').eq('email', email).single()
  if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
  const hashed = await hashPassword(password)
  const { data, error } = await supabaseAdmin.from('users').insert({ name, email, password: hashed, role: 'user' }).select().single()
  if (error) return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  return NextResponse.json({ id: data.id, email: data.email })
}
