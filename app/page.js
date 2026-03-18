'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const BADGE_COLORS = {
  'HOT': '#ff3c6e', 'SAVE 63%': '#00f5c4', 'FAST': '#7b5cff',
  'CHEAP': '#fbbf24', 'INSTANT': '#00f5c4', 'POPULAR': '#ff3c6e'
}

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    loadProducts()
    loadSettings()
    checkSession()
  }, [])

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').eq('active', true).order('featured', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  async function loadSettings() {
    const { data } = await supabase.from('settings').select('*')
    if (data) {
      const s = {}
      data.forEach(r => s[r.key] = r.value)
      setSettings(s)
    }
  }

  async function checkSession() {
    const res = await fetch('/api/auth/me')
    if (res.ok) setUser(await res.json())
  }

  const filtered = filter === 'ALL' ? products : products.filter(p => p.category === filter)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0)

  function addToCart(product) {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id)
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, qty: 1 }]
    })
    setCartOpen(true)
  }

  function removeFromCart(id) { setCart(prev => prev.filter(i => i.product.id !== id)) }

  const discount = (p, o) => o ? Math.round((1 - p / o) * 100) : 0

  const S = {
    nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, background: 'rgba(5,8,16,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1a2340' },
    logo: { fontFamily: "'Space Mono',monospace", fontSize: '1.2rem', fontWeight: 700, color: '#00f5c4', textShadow: '0 0 20px rgba(0,245,196,0.4)', textDecoration: 'none' },
    btn: { background: '#00f5c4', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' },
    card: { background: '#0f1526', border: '1px solid #1a2340', borderRadius: 16, padding: 20, transition: 'all 0.3s', cursor: 'default' },
  }

  const cartItems = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <div onClick={() => setCartOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 360, background: '#0b0f1e', borderLeft: '1px solid #1a2340', padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 800 }}>Cart ({cartCount})</h2>
          <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: '#6b7296', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
        </div>
        {cart.length === 0 ? <p style={{ color: '#6b7296', textAlign: 'center', marginTop: 60 }}>Cart is empty</p> : (
          <>
            {cart.map(item => (
              <div key={item.product.id} style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                {item.product.image_url && <img src={item.product.image_url} alt={item.product.name} style={{ width: 40, height: 40, objectFit: 'contain', marginBottom: 8 }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.product.name}</p>
                    <p style={{ color: '#00f5c4', fontFamily: "'Space Mono',monospace", fontSize: '0.85rem' }}>৳{item.product.price} × {item.qty}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: '#ff3c6e', cursor: 'pointer', fontSize: '1.3rem' }}>×</button>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #1a2340', paddingTop: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ color: '#00f5c4', fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: '1.1rem' }}>৳{cartTotal}</span>
              </div>
              <a href={`/checkout?items=${encodeURIComponent(JSON.stringify(cart.map(i => ({ id: i.product.id, name: i.product.name, price: i.product.price, qty: i.qty }))))}`}>
                <button style={{ ...S.btn, width: '100%', padding: 14, fontSize: '1rem', boxShadow: '0 0 30px rgba(0,245,196,0.3)' }}>Checkout →</button>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ background: '#050810', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(0,245,196,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,196,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

      {/* NAV */}
      <nav style={S.nav}>
        <a href="/" style={S.logo}>VPN<span style={{ color: '#e8eaf6' }}>Store</span><span style={{ color: '#6b7296', fontSize: '0.7rem' }}> BD</span></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user ? (
            <>
              {user.role === 'admin' && <a href="/admin" style={{ color: '#00f5c4', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>Admin ↗</a>}
              <a href="/orders" style={{ color: '#6b7296', fontSize: '0.85rem', textDecoration: 'none' }}>My Orders</a>
              <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null) }} style={{ background: 'none', border: '1px solid #1a2340', color: '#6b7296', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem' }}>Logout</button>
            </>
          ) : (
            <a href="/auth/login" style={{ color: '#6b7296', fontSize: '0.85rem', textDecoration: 'none' }}>Login</a>
          )}
          <button onClick={() => setCartOpen(!cartOpen)} style={{ position: 'relative', background: 'rgba(0,245,196,0.1)', border: '1px solid rgba(0,245,196,0.2)', color: '#00f5c4', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            🛒 Cart
            {cartCount > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: '#ff3c6e', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {cartOpen && cartItems}

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 64 }}>
        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '80px 32px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(123,92,255,0.15) 0%,transparent 70%)', top: -200, left: -100, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,245,196,0.1) 0%,transparent 70%)', bottom: -50, right: -50, pointerEvents: 'none' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,245,196,0.08)', border: '1px solid rgba(0,245,196,0.25)', padding: '8px 18px', borderRadius: 100, fontSize: '0.75rem', color: '#00f5c4', marginBottom: 24, fontFamily: "'Space Mono',monospace" }}>
            ● Instant Digital Delivery — 24/7
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 16 }}>
            {settings.site_name || 'VPNStore BD'}<br />
            <span style={{ background: 'linear-gradient(90deg,#00f5c4,#7b5cff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Best Price Guaranteed</span>
          </h1>
          <p style={{ color: '#6b7296', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.7 }}>
            {settings.site_tagline || 'NordVPN, ExpressVPN, Google Play, Steam & more at lowest prices. Instant delivery.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[['🔒', 'Secure', 'AES-256'], ['⚡', 'Fast', 'Instant Delivery'], ['💰', 'Cheap', 'Best Price BD'], ['📱', 'Easy', 'bKash/Nagad']].map(([icon, title, sub]) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</div>
                <div style={{ color: '#6b7296', fontSize: '0.75rem' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FILTER */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '0 32px 40px', flexWrap: 'wrap' }}>
          {[['ALL', '✨ All'], ['VPN', '🛡️ VPN'], ['GIFT_CARD', '🎁 Gift Cards']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding: '10px 24px', borderRadius: 100, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', background: filter === val ? '#00f5c4' : 'transparent', color: filter === val ? '#000' : '#6b7296', border: filter === val ? 'none' : '1px solid #1a2340', boxShadow: filter === val ? '0 0 20px rgba(0,245,196,0.3)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
          {loading ? [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ ...S.card, height: 300, background: 'linear-gradient(90deg,#0f1526,#1a2340,#0f1526)', backgroundSize: '200% 100%' }} />
          )) : filtered.map(product => (
            <div key={product.id} style={S.card}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,245,196,0.3)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#1a2340'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {product.badge && (
                <div style={{ float: 'right', background: BADGE_COLORS[product.badge] || '#00f5c4', color: ['SAVE 63%', 'INSTANT', 'CHEAP'].includes(product.badge) ? '#000' : '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 100, letterSpacing: 1, fontFamily: "'Space Mono',monospace" }}>
                  {product.badge}
                </div>
              )}
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 12 }} onError={e => { e.target.style.display = 'none' }} />
              ) : (
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{product.category === 'VPN' ? '🛡️' : '🎁'}</div>
              )}
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 6, clear: 'both' }}>{product.name}</h3>
              {product.duration && <span style={{ fontSize: '0.75rem', color: '#7b5cff', fontWeight: 700, background: 'rgba(123,92,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>{product.duration}</span>}
              <p style={{ color: '#6b7296', fontSize: '0.82rem', marginTop: 8, marginBottom: 12, lineHeight: 1.5 }}>{product.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {(product.features || []).slice(0, 3).map(f => (
                  <span key={f} style={{ fontSize: '0.7rem', color: '#6b7296', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4 }}>✓ {f}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '1.4rem', fontWeight: 700, color: '#00f5c4' }}>৳{product.price}</span>
                {product.original_price && <span style={{ textDecoration: 'line-through', color: '#6b7296', fontSize: '0.85rem' }}>৳{product.original_price}</span>}
                {product.original_price && <span style={{ fontSize: '0.7rem', color: '#ff3c6e', fontWeight: 700 }}>-{discount(product.price, product.original_price)}%</span>}
              </div>
              <button onClick={() => addToCart(product)} style={{ width: '100%', background: 'linear-gradient(135deg,rgba(0,245,196,0.15),rgba(123,92,255,0.15))', border: '1px solid rgba(0,245,196,0.25)', color: '#00f5c4', padding: 12, borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.background = '#00f5c4'; e.target.style.color = '#000' }}
                onMouseLeave={e => { e.target.style.background = 'linear-gradient(135deg,rgba(0,245,196,0.15),rgba(123,92,255,0.15))'; e.target.style.color = '#00f5c4' }}
              >
                Add to Cart 🛒
              </button>
            </div>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <div style={{ background: '#0b0f1e', borderTop: '1px solid #1a2340', borderBottom: '1px solid #1a2340', padding: '80px 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: '#00f5c4', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>// HOW IT WORKS</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: 60 }}>Order in 3 simple steps</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
              {[['01', 'Choose Product', 'Browse VPNs and Gift Cards. Pick what you need.'], ['02', 'Pay via bKash/Card', `Send to bKash ${settings.bkash_number || '01942786193'} or pay with card.`], ['03', 'Get Instant Key', 'Receive your product key via email immediately.']].map(([num, title, desc]) => (
                <div key={num} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '3rem', fontWeight: 700, color: 'rgba(0,245,196,0.15)', marginBottom: 12 }}>{num}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                  <p style={{ color: '#6b7296', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div style={{ padding: '60px 32px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#6b7296', marginBottom: 20, fontSize: '0.9rem' }}>Accepted Payment Methods</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {[['bKash', '#e2136e', 'rgba(226,19,110,0.1)'], ['Nagad', '#f7941d', 'rgba(247,148,29,0.1)'], ['Stripe', '#7b5cff', 'rgba(123,92,255,0.1)'], ['USDT', '#26a17b', 'rgba(38,161,123,0.1)'], ['Bitcoin', '#f7931a', 'rgba(247,147,26,0.1)']].map(([name, color, bg]) => (
              <div key={name} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 10, padding: '10px 24px', color, fontWeight: 700, fontSize: '0.9rem' }}>{name}</div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid #1a2340', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, color: '#00f5c4' }}>VPN<span style={{ color: '#e8eaf6' }}>Store</span> <span style={{ color: '#6b7296', fontSize: '0.7rem' }}>BD</span></div>
          <div style={{ color: '#6b7296', fontSize: '0.8rem' }}>© 2024 VPNStore BD. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            {settings.whatsapp && <a href={`https://wa.me/${settings.whatsapp}`} style={{ color: '#25d366', fontSize: '0.85rem', textDecoration: 'none' }}>💬 WhatsApp</a>}
          </div>
        </footer>
      </div>
    </div>
  )
}
