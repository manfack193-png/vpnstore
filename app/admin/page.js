'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const STATUS_COLORS = {
  pending: { color: '#f7941d', bg: 'rgba(247,148,29,0.1)', label: '⏳ Pending' },
  completed: { color: '#00f5c4', bg: 'rgba(0,245,196,0.1)', label: '✅ Completed' },
  cancelled: { color: '#ff3c6e', bg: 'rgba(255,60,110,0.1)', label: '❌ Cancelled' },
}

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [settings, setSettings] = useState({})
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ revenue: 0, orders: 0, pending: 0, users: 0 })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [deliverKey, setDeliverKey] = useState('')
  const [editProduct, setEditProduct] = useState(null)
  const [newProduct, setNewProduct] = useState(false)
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', original_price: '', category: 'VPN', image_url: '', badge: '', features: '', duration: '', active: true, featured: false })
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState({})
  const [adminCheck, setAdminCheck] = useState(false)

  useEffect(() => { checkAdmin() }, [])

  async function checkAdmin() {
    const res = await fetch('/api/auth/me')
    if (!res.ok || (await res.json()).role !== 'admin') {
      window.location.href = '/auth/login'
      return
    }
    setAdminCheck(true)
    loadAll()
  }

  async function loadAll() {
    setLoading(true)
    const [ordersRes, productsRes, settingsRes, usersRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*'),
      supabase.from('users').select('id,name,email,role,created_at').order('created_at', { ascending: false }),
    ])
    const o = ordersRes.data || []
    const s = {}
    ;(settingsRes.data || []).forEach(r => s[r.key] = r.value)
    setOrders(o)
    setProducts(productsRes.data || [])
    setSettings(s)
    setSettingsForm(s)
    setUsers(usersRes.data || [])
    setStats({
      revenue: o.filter(x => x.status === 'completed').reduce((sum, x) => sum + x.total, 0),
      orders: o.length,
      pending: o.filter(x => x.status === 'pending').length,
      users: (usersRes.data || []).length,
    })
    setLoading(false)
  }

  async function updateOrderStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    setStats(prev => ({ ...prev, pending: prev.pending + (status === 'pending' ? 1 : -1) }))
  }

  async function deliverKeys(orderId) {
    const keys = deliverKey.split('\n').filter(k => k.trim())
    await supabase.from('orders').update({ delivered_keys: keys, status: 'completed' }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, delivered_keys: keys, status: 'completed' } : o))
    setSelectedOrder(null)
    setDeliverKey('')
  }

  async function saveSettings() {
    setSavingSettings(true)
    for (const [key, value] of Object.entries(settingsForm)) {
      await supabase.from('settings').upsert({ key, value })
    }
    setSettings(settingsForm)
    setSavingSettings(false)
    alert('Settings saved!')
  }

  async function saveProduct() {
    const data = {
      ...productForm,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      features: productForm.features ? productForm.features.split(',').map(f => f.trim()) : [],
    }
    if (editProduct) {
      await supabase.from('products').update(data).eq('id', editProduct.id)
    } else {
      await supabase.from('products').insert(data)
    }
    setEditProduct(null)
    setNewProduct(false)
    setProductForm({ name: '', description: '', price: '', original_price: '', category: 'VPN', image_url: '', badge: '', features: '', duration: '', active: true, featured: false })
    loadAll()
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function startEdit(product) {
    setEditProduct(product)
    setProductForm({ ...product, features: (product.features || []).join(', '), original_price: product.original_price || '' })
    setNewProduct(true)
  }

  const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus)

  const inp = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #1a2340', borderRadius: 8, padding: '10px 14px', color: '#e8eaf6', fontSize: '0.9rem', outline: 'none', fontFamily: "'Syne',sans-serif", boxSizing: 'border-box', marginBottom: 12 }
  const label = { display: 'block', marginBottom: 6, fontSize: '0.8rem', fontWeight: 700, color: '#6b7296' }

  if (!adminCheck) return <div style={{ background: '#050810', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7296' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050810', color: '#e8eaf6', fontFamily: "'Syne',sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#0b0f1e', borderRight: '1px solid #1a2340', padding: 20, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <a href="/" style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, color: '#00f5c4', marginBottom: 32, fontSize: '1rem', textDecoration: 'none', display: 'block' }}>
          VPN<span style={{ color: '#e8eaf6' }}>Store</span> <span style={{ fontSize: '0.6rem', color: '#6b7296' }}>ADMIN</span>
        </a>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[['dashboard', '📊', 'Dashboard'], ['orders', '📦', `Orders ${stats.pending > 0 ? `(${stats.pending})` : ''}`], ['products', '🛒', 'Products'], ['settings', '⚙️', 'Settings'], ['users', '👥', 'Users']].map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, background: tab === id ? 'rgba(0,245,196,0.1)' : 'transparent', border: tab === id ? '1px solid rgba(0,245,196,0.2)' : '1px solid transparent', color: tab === id ? '#00f5c4' : '#6b7296', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', textAlign: 'left', fontFamily: "'Syne',sans-serif" }}>
              {icon} {label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #1a2340' }}>
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/' }} style={{ background: 'none', border: 'none', color: '#6b7296', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Syne',sans-serif" }}>← Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: 28 }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: '#6b7296', marginBottom: 28 }}>Welcome back, Admin!</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
              {[['💰 Revenue', `৳${stats.revenue.toLocaleString()}`, '#00f5c4'], ['📦 Orders', stats.orders, '#7b5cff'], ['⏳ Pending', stats.pending, '#f7941d'], ['👥 Users', stats.users, '#00d4ff']].map(([label, value, color]) => (
                <div key={label} style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 14, padding: 20 }}>
                  <p style={{ color: '#6b7296', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</p>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '1.8rem', fontWeight: 700, color }}>{value}</p>
                </div>
              ))}
            </div>
            <div style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Orders</h3>
              {orders.slice(0, 5).map(order => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1a2340' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{order.customer_email}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7296' }}>{new Date(order.created_at).toLocaleString('en-BD')} · {order.payment_method}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: "'Space Mono',monospace", color: '#00f5c4', fontWeight: 700 }}>৳{order.total}</p>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: STATUS_COLORS[order.status]?.bg, color: STATUS_COLORS[order.status]?.color }}>{STATUS_COLORS[order.status]?.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-1px' }}>Orders</h1>
                <p style={{ color: '#6b7296', fontSize: '0.85rem' }}>{stats.pending} pending orders</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['ALL', 'pending', 'completed', 'cancelled'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '7px 14px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', background: filterStatus === s ? 'rgba(0,245,196,0.1)' : 'transparent', color: filterStatus === s ? '#00f5c4' : '#6b7296', border: filterStatus === s ? '1px solid rgba(0,245,196,0.3)' : '1px solid #1a2340', fontFamily: "'Syne',sans-serif" }}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 14, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a2340' }}>
                    {['Customer', 'Items', 'Total', 'Payment', 'Trx ID', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.72rem', color: '#6b7296', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #1a2340' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{order.customer_email}</p>
                        <p style={{ fontSize: '0.72rem', color: '#6b7296' }}>{order.customer_name}</p>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#6b7296' }}>
                        {(order.items || []).map(i => i.name).join(', ').slice(0, 30)}...
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: "'Space Mono',monospace", fontWeight: 700, color: '#00f5c4' }}>৳{order.total}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 4, background: order.payment_method === 'BKASH' ? 'rgba(226,19,110,0.1)' : order.payment_method === 'NAGAD' ? 'rgba(247,148,29,0.1)' : 'rgba(123,92,255,0.1)', color: order.payment_method === 'BKASH' ? '#e2136e' : order.payment_method === 'NAGAD' ? '#f7941d' : '#7b5cff', fontWeight: 700 }}>
                          {order.payment_method}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: '#6b7296' }}>{order.transaction_id || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: STATUS_COLORS[order.status]?.bg, color: STATUS_COLORS[order.status]?.color }}>
                          {STATUS_COLORS[order.status]?.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => setSelectedOrder(order)} style={{ background: 'rgba(0,245,196,0.1)', border: '1px solid rgba(0,245,196,0.2)', color: '#00f5c4', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-1px' }}>Products</h1>
              <button onClick={() => { setNewProduct(true); setEditProduct(null); setProductForm({ name: '', description: '', price: '', original_price: '', category: 'VPN', image_url: '', badge: '', features: '', duration: '', active: true, featured: false }) }} style={{ background: '#00f5c4', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
                + Add Product
              </button>
            </div>

            {newProduct && (
              <div style={{ background: '#0f1526', border: '1px solid rgba(0,245,196,0.2)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{editProduct ? 'Edit Product' : 'New Product'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={label}>Product Name *</label><input placeholder="NordVPN 1 Month" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} style={inp} /></div>
                  <div><label style={label}>Category *</label>
                    <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} style={{ ...inp, marginBottom: 0 }}>
                      <option value="VPN">VPN</option>
                      <option value="GIFT_CARD">Gift Card</option>
                      <option value="SOFTWARE">Software</option>
                    </select>
                  </div>
                  <div><label style={label}>Price (৳) *</label><input type="number" placeholder="299" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} style={inp} /></div>
                  <div><label style={label}>Original Price (৳)</label><input type="number" placeholder="799" value={productForm.original_price} onChange={e => setProductForm(p => ({ ...p, original_price: e.target.value }))} style={inp} /></div>
                  <div><label style={label}>Image URL</label><input placeholder="https://..." value={productForm.image_url} onChange={e => setProductForm(p => ({ ...p, image_url: e.target.value }))} style={inp} /></div>
                  <div><label style={label}>Badge</label><input placeholder="HOT / SAVE 63% / FAST" value={productForm.badge} onChange={e => setProductForm(p => ({ ...p, badge: e.target.value }))} style={inp} /></div>
                  <div><label style={label}>Duration</label><input placeholder="1 Month / 6 Months" value={productForm.duration} onChange={e => setProductForm(p => ({ ...p, duration: e.target.value }))} style={inp} /></div>
                  <div><label style={label}>Features (comma separated)</label><input placeholder="6000+ Servers, No-Log, Kill Switch" value={productForm.features} onChange={e => setProductForm(p => ({ ...p, features: e.target.value }))} style={inp} /></div>
                </div>
                <div><label style={label}>Description</label><textarea placeholder="Product description..." value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' }} /></div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={productForm.active} onChange={e => setProductForm(p => ({ ...p, active: e.target.checked }))} /> Active
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={productForm.featured} onChange={e => setProductForm(p => ({ ...p, featured: e.target.checked }))} /> Featured
                  </label>
                </div>
                {productForm.image_url && <img src={productForm.image_url} alt="preview" style={{ width: 60, height: 60, objectFit: 'contain', marginBottom: 12 }} onError={e => e.target.style.display = 'none'} />}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={saveProduct} style={{ background: '#00f5c4', color: '#000', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
                    {editProduct ? 'Update' : 'Save Product'}
                  </button>
                  <button onClick={() => { setNewProduct(false); setEditProduct(null) }} style={{ background: 'transparent', border: '1px solid #1a2340', color: '#6b7296', padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
              {products.map(p => (
                <div key={p.id} style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 14, padding: 18, opacity: p.active ? 1 : 0.5 }}>
                  {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: 40, height: 40, objectFit: 'contain', marginBottom: 8 }} onError={e => e.target.style.display = 'none'} />}
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{p.name}</p>
                  <p style={{ color: '#6b7296', fontSize: '0.75rem', marginBottom: 8 }}>{p.category} {p.duration ? `· ${p.duration}` : ''}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontFamily: "'Space Mono',monospace", color: '#00f5c4', fontWeight: 700 }}>৳{p.price}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {p.featured && <span style={{ fontSize: '0.65rem', background: 'rgba(0,245,196,0.1)', color: '#00f5c4', padding: '2px 6px', borderRadius: 4 }}>Featured</span>}
                      {!p.active && <span style={{ fontSize: '0.65rem', background: 'rgba(255,60,110,0.1)', color: '#ff3c6e', padding: '2px 6px', borderRadius: 4 }}>Inactive</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEdit(p)} style={{ flex: 1, background: 'rgba(123,92,255,0.1)', border: '1px solid rgba(123,92,255,0.2)', color: '#7b5cff', padding: '7px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>Edit</button>
                    <button onClick={() => deleteProduct(p.id)} style={{ flex: 1, background: 'rgba(255,60,110,0.1)', border: '1px solid rgba(255,60,110,0.2)', color: '#ff3c6e', padding: '7px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: 24 }}>Settings</h1>
            <div style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 16, padding: 28, maxWidth: 600 }}>
              {[
                ['site_name', 'Site Name', 'VPNStore BD'],
                ['site_tagline', 'Site Tagline', 'Best VPN & Gift Cards in Bangladesh'],
                ['bkash_number', 'bKash Number', '01942786193'],
                ['nagad_number', 'Nagad Number', '01942786193'],
                ['whatsapp', 'WhatsApp Number', '01942786193'],
                ['usdt_address', 'USDT (TRC20) Address', 'TXXXXXXXXXXXXxx'],
                ['btc_address', 'Bitcoin Address', 'bc1XXXXXX'],
              ].map(([key, lbl, placeholder]) => (
                <div key={key} style={{ marginBottom: 18 }}>
                  <label style={label}>{lbl}</label>
                  <input value={settingsForm[key] || ''} onChange={e => setSettingsForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} style={inp} />
                </div>
              ))}
              <button onClick={saveSettings} disabled={savingSettings} style={{ background: '#00f5c4', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontSize: '1rem', fontFamily: "'Syne',sans-serif" }}>
                {savingSettings ? 'Saving...' : 'Save Settings ✓'}
              </button>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: 24 }}>Users</h1>
            <div style={{ background: '#0f1526', border: '1px solid #1a2340', borderRadius: 14, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a2340' }}>
                    {['Name', 'Email', 'Role', 'Joined'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', color: '#6b7296', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #1a2340' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.9rem' }}>{user.name || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7296', fontSize: '0.85rem' }}>{user.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: user.role === 'admin' ? 'rgba(255,60,110,0.1)' : 'rgba(0,245,196,0.08)', color: user.role === 'admin' ? '#ff3c6e' : '#00f5c4' }}>
                          {user.role?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#6b7296', fontSize: '0.82rem' }}>{new Date(user.created_at).toLocaleDateString('en-BD')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} />
          <div style={{ position: 'relative', background: '#0b0f1e', border: '1px solid #1a2340', borderRadius: 20, padding: 28, width: 480, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 4 }}>Manage Order</h3>
            <p style={{ color: '#6b7296', fontSize: '0.75rem', marginBottom: 20, fontFamily: "'Space Mono',monospace" }}>{selectedOrder.id}</p>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
                <div><span style={{ color: '#6b7296' }}>Customer:</span><br /><strong>{selectedOrder.customer_email}</strong></div>
                <div><span style={{ color: '#6b7296' }}>Amount:</span><br /><strong style={{ color: '#00f5c4' }}>৳{selectedOrder.total}</strong></div>
                <div><span style={{ color: '#6b7296' }}>Payment:</span><br /><strong>{selectedOrder.payment_method}</strong></div>
                <div><span style={{ color: '#6b7296' }}>TrxID:</span><br /><strong style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem' }}>{selectedOrder.transaction_id || '—'}</strong></div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 8, color: '#6b7296' }}>ITEMS ORDERED:</p>
              {(selectedOrder.items || []).map((item, i) => (
                <p key={i} style={{ fontSize: '0.85rem', color: '#e8eaf6', marginBottom: 4 }}>• {item.name} × {item.qty} — ৳{item.price * item.qty}</p>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 700 }}>Deliver Product Key(s) — one per line</label>
              <textarea value={deliverKey} onChange={e => setDeliverKey(e.target.value)} placeholder="KEY-XXXX-YYYY-ZZZZ" rows={4} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #1a2340', borderRadius: 10, padding: '12px 16px', color: '#e8eaf6', fontSize: '0.85rem', resize: 'vertical', outline: 'none', fontFamily: "'Space Mono',monospace", boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => deliverKeys(selectedOrder.id)} style={{ flex: 1, background: 'rgba(0,245,196,0.1)', border: '1px solid rgba(0,245,196,0.2)', color: '#00f5c4', padding: 12, borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
                ✓ Deliver & Complete
              </button>
              <button onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')} style={{ flex: 1, background: 'rgba(255,60,110,0.1)', border: '1px solid rgba(255,60,110,0.2)', color: '#ff3c6e', padding: 12, borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
                × Cancel
              </button>
            </div>
            {selectedOrder.delivered_keys?.length > 0 && (
              <div style={{ marginTop: 12, background: 'rgba(0,245,196,0.05)', border: '1px solid rgba(0,245,196,0.2)', borderRadius: 8, padding: 12 }}>
                <p style={{ fontSize: '0.78rem', color: '#00f5c4', marginBottom: 6 }}>Previously delivered keys:</p>
                {selectedOrder.delivered_keys.map((k, i) => <p key={i} style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.8rem' }}>{k}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
