'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    if (data.role === 'admin') router.push('/admin')
    else router.push('/')
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #1a2340', borderRadius: 10, padding: '12px 16px', color: '#e8eaf6', fontSize: '0.95rem', outline: 'none', fontFamily: "'Syne',sans-serif", boxSizing: 'border-box' }

  return (
    <div style={{ background: '#050810', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 400, padding: 40, background: '#0f1526', border: '1px solid #1a2340', borderRadius: 20 }}>
        <a href="/" style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, color: '#00f5c4', marginBottom: 28, fontSize: '1.1rem', textDecoration: 'none', display: 'block' }}>VPN<span style={{ color: '#e8eaf6' }}>Store</span></a>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>Login</h1>
        <p style={{ color: '#6b7296', marginBottom: 24, fontSize: '0.9rem' }}>Access your account and orders</p>
        {error && <div style={{ background: 'rgba(255,60,110,0.1)', border: '1px solid rgba(255,60,110,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff3c6e', fontSize: '0.85rem', marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" required style={inp} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required style={inp} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#00f5c4', color: '#000', border: 'none', padding: 14, borderRadius: 10, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 0 30px rgba(0,245,196,0.2)', fontFamily: "'Syne',sans-serif" }}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#6b7296', fontSize: '0.85rem' }}>
          No account? <a href="/auth/register" style={{ color: '#00f5c4', textDecoration: 'none', fontWeight: 700 }}>Register</a>
        </p>
      </div>
    </div>
  )
}
