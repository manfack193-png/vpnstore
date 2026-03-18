'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState([])
  const [settings, setSettings] = useState({})
  const [step, setStep] = useState('info')
  const [payMethod, setPayMethod] = useState('BKASH')
  const [form, setForm] = useState({ name: '', email: '', txId: '' })
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const raw = searchParams.get('items')
    if (raw) try { setItems(JSON.parse(decodeURIComponent(raw))) } catch { }
    loadSettings()
  }, [])

  async function loadSettings() {
    const { data } = await supabase.from('settings').select('*')
    if (data) { const s = {}; data.forEach(r => s[r.key] = r.value); setSettings(s) }
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  const METHODS = [
    { id: 'BKASH', label: 'bKash', color: '#e2136e', number: settings.bkash_number || '01942786193' },
    { id: 'NAGAD', label: 'Nagad', color: '#f7941d', number: settings.nagad_number || '01942786193' },
    { id: 'STRIPE', label: 'Card', color: '#7b5cff', number: '' },
    { id: 'CRYPTO', label: 'USDT/BTC', color: '#26a17b', number: settings.usdt_address || '' },
  ]

  const method = METHODS.find(m => m.id === payMethod)

  async function placeOrder() {
    if (!form.email) return alert('Email দাও!')
    if ((payMethod === 'BKASH' || payMethod === 'NAGAD') && !form.txId) return alert('Transaction ID দাও!')
    setLoading(true)
    const { data, error } = await supabase.from('orders').insert({
      customer_email: form.email,
      customer_name: form.name,
      items: items,
      total,
      payment_method: payMethod,
      transaction_id: form.txId,
      status: 'pending',
    }).select().single()
    if (error) { alert('Error! Try again.'); setLoading(false); return }
    setOrderId(data.id)
    setStep('done')
    setLoading(false)
  }

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #1a2340', borderRadius: 10, padding: '12px 16px', color: '#e8eaf6', fontSize: '0.95rem', outline: 'none', fontFamily: "'Syne',sans-serif", boxSizing: 'border-box' }

  if (step === 'done') return (
    <div style={{ background: '#050810', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#0f1526', border: '1px solid rgba(0,245,196,0.3)', borderRadius: 20, padding: 48, textAlign: 'center', maxWidth: 500, width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Order Placed!</h2>
        <p style={{ color: '#6b7296', marginBottom: 16 }}>Order ID: <span style={{ fontFamily: "'Space Mono',monospace", color: '#00f5c4', fontSize: '0.8rem' }}>{orderId.slice(0, 8)}...</span></p>
        <div style={{ background: 'rgba(0,245,196,0.05)', border: '1px solid rgba(0,245,196,0.15)', borderRadius: 10, padding: 16, marginBottom: 24, fontSize: '0.9rem', color: '#6b7296' }}>
          📧 Keys will be sent to: <strong style={{ color: '#e8eaf6' }}>{form.email}</strong><br />
          ⏳ Delivery within 1-2 hours after payment verification.
        </div>
        <a href="/"><button style={{ background: '#00f5c4', color: '#000', border: 'none', padding: '14px 32px', borderRadius: 10, fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>Continue Shopping →</button></a>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#050810', minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <a href="/" style={{ color: '#6b7296', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: 32 }}>← Back to Shop</a>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 24 }}>Checkout</h1>

        {/* Order Summary */}
        <div style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#6b7296', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>Order Summary</h3>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a2340' }}>
              <span style={{ fontSize: '0.9rem' }}>{item.name} × {item.qty}</span>
              <span style={{ fontFamily: "'Space Mono',monospace", color: '#00f5c4', fontWeight: 700 }}>৳{item.price * item.qty}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16 }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '1.3rem', color: '#00f5c4', fontWeight: 700 }}>৳{total}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Your Information</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Your Name</label>
            <input placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Email *</label>
            <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inp} required />
            <p style={{ color: '#6b7296', fontSize: '0.78rem', marginTop: 6 }}>Product keys will be sent here.</p>
          </div>
        </div>

        {/* Payment */}
        <div style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Payment Method</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {METHODS.map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id)} style={{ background: payMethod === m.id ? `${m.color}22` : 'transparent', border: `2px solid ${payMethod === m.id ? m.color : '#1a2340'}`, borderRadius: 10, padding: 14, color: payMethod === m.id ? m.color : '#6b7296', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Syne',sans-serif" }}>
                {m.label}
              </button>
            ))}
          </div>

          {method?.number && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a2340', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: '0.85rem', color: '#6b7296', marginBottom: 12 }}>Send <strong style={{ color: '#ff3c6e' }}>৳{total}</strong> to this {method.label} number:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,245,196,0.05)', border: '1px solid rgba(0,245,196,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                <span style={{ fontFamily: "'Space Mono',monospace", color: '#00f5c4', fontWeight: 700, fontSize: '1.1rem' }}>{method.number}</span>
                <button onClick={() => { navigator.clipboard.writeText(method.number); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(0,245,196,0.3)', color: '#00f5c4', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Transaction ID *</label>
                <input placeholder="8XXXXXXXXX" value={form.txId} onChange={e => setForm(p => ({ ...p, txId: e.target.value }))} style={inp} />
              </div>
            </div>
          )}

          {payMethod === 'CRYPTO' && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a2340', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: '0.85rem', color: '#6b7296', marginBottom: 8 }}>USDT (TRC20):</p>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: '#00f5c4', wordBreak: 'break-all' }}>{settings.usdt_address}</p>
              <div style={{ marginTop: 12 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Transaction Hash *</label>
                <input placeholder="0x..." value={form.txId} onChange={e => setForm(p => ({ ...p, txId: e.target.value }))} style={inp} />
              </div>
            </div>
          )}

          {payMethod === 'STRIPE' && (
            <div style={{ background: 'rgba(123,92,255,0.05)', border: '1px solid rgba(123,92,255,0.2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <p style={{ fontSize: '0.85rem', color: '#7b5cff' }}>💳 Card payment — coming soon! Please use bKash/Nagad for now.</p>
            </div>
          )}

          <button onClick={placeOrder} disabled={loading} style={{ width: '100%', background: loading ? '#1a2340' : '#00f5c4', color: loading ? '#6b7296' : '#000', border: 'none', padding: 14, borderRadius: 10, fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 0 30px rgba(0,245,196,0.3)', fontFamily: "'Syne',sans-serif" }}>
            {loading ? 'Placing Order...' : 'Confirm Order ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return <Suspense fallback={<div style={{ background: '#050810', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7296' }}>Loading...</div>}><CheckoutContent /></Suspense>
}
