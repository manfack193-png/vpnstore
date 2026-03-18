'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const STATUS_COLORS = {
  pending: { color: '#f7941d', bg: 'rgba(247,148,29,0.1)', label: '⏳ Pending Verification' },
  completed: { color: '#00f5c4', bg: 'rgba(0,245,196,0.1)', label: '✅ Completed' },
  cancelled: { color: '#ff3c6e', bg: 'rgba(255,60,110,0.1)', label: '❌ Cancelled' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [email, setEmail] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function searchOrders(e) {
    e.preventDefault()
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').eq('customer_email', searchEmail).order('created_at', { ascending: false })
    setOrders(data || [])
    setEmail(searchEmail)
    setLoading(false)
  }

  return (
    <div style={{ background: '#050810', minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <a href="/" style={{ color: '#6b7296', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: 32 }}>← Back to Shop</a>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>My Orders</h1>
        <p style={{ color: '#6b7296', marginBottom: 28 }}>Enter your email to view orders</p>

        <form onSubmit={searchOrders} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <input type="email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} placeholder="your@email.com" required style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid #1a2340', borderRadius: 10, padding: '12px 16px', color: '#e8eaf6', fontSize: '0.95rem', outline: 'none', fontFamily: "'Syne',sans-serif" }} />
          <button type="submit" disabled={loading} style={{ background: '#00f5c4', color: '#000', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
            {loading ? '...' : 'Search'}
          </button>
        </form>

        {email && orders.length === 0 && <p style={{ color: '#6b7296', textAlign: 'center', padding: '60px 0' }}>No orders found for {email}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: '#6b7296' }}>{order.id.slice(0, 8)}...</p>
                  <p style={{ fontWeight: 700, marginTop: 4 }}>{(order.items || []).map(i => i.name).join(', ')}</p>
                  <p style={{ fontSize: '0.8rem', color: '#6b7296', marginTop: 4 }}>{new Date(order.created_at).toLocaleString('en-BD')} · {order.payment_method}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Space Mono',monospace", color: '#00f5c4', fontWeight: 700, fontSize: '1.1rem' }}>৳{order.total}</p>
                  <span style={{ display: 'inline-block', marginTop: 6, fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: STATUS_COLORS[order.status]?.bg, color: STATUS_COLORS[order.status]?.color }}>
                    {STATUS_COLORS[order.status]?.label}
                  </span>
                </div>
              </div>

              {order.status === 'completed' && order.delivered_keys?.length > 0 && (
                <div style={{ background: 'rgba(0,245,196,0.05)', border: '1px solid rgba(0,245,196,0.2)', borderRadius: 10, padding: 16 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f5c4', marginBottom: 8 }}>🎉 Your Product Key(s)</p>
                  {order.delivered_keys.map((key, i) => (
                    <p key={i} style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.9rem', letterSpacing: 1, marginBottom: 4 }}>{key}</p>
                  ))}
                </div>
              )}

              {order.status === 'pending' && (
                <div style={{ background: 'rgba(247,148,29,0.05)', border: '1px solid rgba(247,148,29,0.2)', borderRadius: 10, padding: 12 }}>
                  <p style={{ fontSize: '0.82rem', color: '#f7941d' }}>⏳ Payment being verified. Key will be delivered within 1-2 hours. WhatsApp করো যদি দেরি হয়!</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
