'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push('/auth/login')
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #1a2340', borderRadius: 10, padding: '12px 16px', color: '#e8eaf6', fontSize: '0.95rem', outline: 'none', fontFamily: "'Syne',sans-serif", boxSizing: 'border-box' }

  return (
    <div style={{ background: '#050810', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 400, padding: 40, background: '#0f1526', border: '1px solid #1a2340', borderRadius: 20 }}>
        <a href="/" style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, color: '#00f5c4', marginBottom: 28, fontSize: '1.1rem', textDecoration: 'none', display: 'block' }}>VPN<span style={{ color: '#e8eaf6' }}>Store</span></a>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>Create Account</h1>
        <p style={{ color: '#6b7296', marginBottom: 24, fontSize: '0.9rem' }}>Join to track your orders</p>
        {error && <div style={{ background: 'rgba(255,60,110,0.1)', border: '1px solid rgba(255,60,110,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff3c6e', fontSize: '0.85rem', marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleRegister}>
          {[['name', 'Full Name', 'text', 'Your name'], ['email', 'Email', 'email', 'your@email.com'], ['password', 'Password', 'password', '••••••••']].map(([key, lbl, type, ph]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>{lbl}</label>
              <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} required={key !== 'name'} style={inp} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#00f5c4', color: '#000', border: 'none', padding: 14, borderRadius: 10, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginTop: 8, boxShadow: '0 0 30px rgba(0,245,196,0.2)', fontFamily: "'Syne',sans-serif" }}>
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#6b7296', fontSize: '0.85rem' }}>
          Already have account? <a href="/auth/login" style={{ color: '#00f5c4', textDecoration: 'none', fontWeight: 700 }}>Login</a>
        </p>
      </div>
    </div>
  )
}
