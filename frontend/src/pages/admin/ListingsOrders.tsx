import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Search,
  RefreshCw,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Wheat,
  Tag,
  Hash,
  Clock,
  IndianRupee,
  ArrowUpDown,
  Eye,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ListingRow {
  id: number;
  category: string;
  category_id: string;
  produce_id?: string;
  crop_name?: string;
  produce_name: string;
  produce_name_kn: string;
  variety: string;
  quantity_kg: number;
  price_per_kg: number;
  farmer_id: string;
  farmer_name: string;
  farmer_email: string;
  farmer_phone: string;
  farmer_district: string;
  farmer_status: string;
  farmer_user_id: string | number;
  image_url: string;
  created_at: string;
}

interface OrderRow {
  id: number;
  listing_id: number;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  buyer_district: string;
  buyer_user_id: string | number;
  crop_name: string;
  quantity: number;
  total_price: number;
  status: string;
  payment_id: string;
  image_url: string;
  created_at: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string;
  seller_district: string;
  listing_produce: string;
  listing_variety: string;
  listing_category: string;
}

type ActiveTab = 'listings' | 'orders';

const CATEGORY_LABELS: Record<string, string> = {
  CEREALS_MILLETS: 'Cereals & Millets',
  PULSES: 'Pulses',
  OILSEEDS: 'Oilseeds',
  COMMERCIAL: 'Commercial Crops',
  PLANTATION: 'Plantation Crops',
  SPICES: 'Spices',
  FRUITS: 'Fruits',
  VEGETABLES: 'Vegetables',
};

function formatDate(raw: string): string {
  if (!raw) return '—';
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    }) + ', ' + d.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch {
    return raw;
  }
}

export default function ListingsOrders() {
  const [tab, setTab] = useState<ActiveTab>('listings');
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedListing, setExpandedListing] = useState<number | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  async function fetchListings() {
    try {
      const res = await axios.get(`${API}/admin/all-listings`);
      setListings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    }
  }

  async function fetchOrders() {
    try {
      const res = await axios.get(`${API}/admin/all-orders`);
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }

  async function loadData() {
    setLoading(true);
    await Promise.all([fetchListings(), fetchOrders()]);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  // Filtered listings
  const filteredListings = listings.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (l.produce_name || '').toLowerCase().includes(s) ||
      (l.variety || '').toLowerCase().includes(s) ||
      (l.farmer_name || '').toLowerCase().includes(s) ||
      (l.farmer_email || '').toLowerCase().includes(s) ||
      (l.farmer_phone || '').includes(s) ||
      (l.farmer_district || '').toLowerCase().includes(s) ||
      (l.category_id || '').toLowerCase().includes(s) ||
      String(l.id).includes(s)
    );
  });

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (o.crop_name || '').toLowerCase().includes(s) ||
      (o.buyer_name || '').toLowerCase().includes(s) ||
      (o.buyer_email || '').toLowerCase().includes(s) ||
      (o.buyer_phone || '').includes(s) ||
      (o.buyer_district || '').toLowerCase().includes(s) ||
      (o.seller_name || '').toLowerCase().includes(s) ||
      (o.seller_email || '').toLowerCase().includes(s) ||
      (o.payment_id || '').toLowerCase().includes(s) ||
      (o.status || '').toLowerCase().includes(s) ||
      String(o.id).includes(s)
    );
  });

  // Stats
  const totalListingValue = listings.reduce((acc, l) => acc + l.quantity_kg * l.price_per_kg, 0);
  const totalOrderValue = orders.reduce((acc, o) => acc + o.total_price, 0);
  const uniqueFarmers = new Set(listings.map(l => l.farmer_id)).size;
  const uniqueBuyers = new Set(orders.map(o => o.buyer_id)).size;

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
            <Layers size={26} style={{ color: '#047857' }} />
            Manage Listings & Orders
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0 0' }}>
            Track all farmer produce listings and buyer orders in real time
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: '#064e3b', color: '#fff', border: 'none',
            cursor: 'pointer', fontWeight: 600, fontSize: 13,
            opacity: loading ? 0.6 : 1
          }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Listings', value: listings.length, icon: <Package size={20} />, sub: `${uniqueFarmers} unique farmers`, color: '#047857' },
          { label: 'Total Orders', value: orders.length, icon: <ShoppingCart size={20} />, sub: `${uniqueBuyers} unique buyers`, color: '#d97706' },
          { label: 'Listing Value', value: `₹${totalListingValue.toLocaleString('en-IN')}`, icon: <IndianRupee size={20} />, sub: 'Total stock value', color: '#2563eb' },
          { label: 'Order Revenue', value: `₹${totalOrderValue.toLocaleString('en-IN')}`, icon: <CreditCard size={20} />, sub: 'Total order revenue', color: '#059669' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
            padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: `${stat.color}15`, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{stat.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Bar + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3 }}>
          <button
            onClick={() => { setTab('listings'); setSearch(''); }}
            style={{
              padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
              background: tab === 'listings' ? '#064e3b' : 'transparent',
              color: tab === 'listings' ? '#fff' : '#475569',
            }}
          >
            <Package size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            Farmer Listings ({listings.length})
          </button>
          <button
            onClick={() => { setTab('orders'); setSearch(''); }}
            style={{
              padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
              background: tab === 'orders' ? '#d97706' : 'transparent',
              color: tab === 'orders' ? '#fff' : '#475569',
            }}
          >
            <ShoppingCart size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            Buyer Orders ({orders.length})
          </button>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={tab === 'listings' ? 'Search by farmer name, produce, variety, district, ID…' : 'Search by buyer name, produce, payment ID, status…'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8,
              border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a',
              background: '#fff', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* LISTINGS TAB */}
      {tab === 'listings' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#064e3b', color: '#fff' }}>
                <th style={thStyle}>#ID</th>
                <th style={thStyle}>Produce & Variety</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Farmer</th>
                <th style={thStyle}>Qty (kg)</th>
                <th style={thStyle}>Price/kg</th>
                <th style={thStyle}>Total Value</th>
                <th style={thStyle}>Listed On</th>
                <th style={thStyle}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
                    {loading ? 'Loading listings…' : search ? 'No listings match your search.' : 'No produce listings found.'}
                  </td>
                </tr>
              ) : filteredListings.map((l) => (
                <React.Fragment key={l.id}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700, color: '#047857' }}>L-{l.id}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{l.produce_name || l.crop_name}</div>
                      {l.variety && <div style={{ fontSize: 11, color: '#64748b' }}>{l.variety}</div>}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        background: '#ecfdf5', color: '#047857', padding: '2px 8px',
                        borderRadius: 4, fontSize: 11, fontWeight: 600
                      }}>
                        {CATEGORY_LABELS[l.category_id] || l.category_id || l.category}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{l.farmer_name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>ID: {l.farmer_user_id}</div>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{l.quantity_kg.toLocaleString('en-IN')}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#047857' }}>₹{l.price_per_kg}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#1e40af' }}>₹{(l.quantity_kg * l.price_per_kg).toLocaleString('en-IN')}</td>
                    <td style={{ ...tdStyle, fontSize: 11, color: '#64748b' }}>{formatDate(l.created_at)}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setExpandedListing(expandedListing === l.id ? null : l.id)}
                        style={{
                          background: 'none', border: '1px solid #cbd5e1', borderRadius: 6,
                          padding: '4px 8px', cursor: 'pointer', color: '#475569', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4
                        }}
                      >
                        <Eye size={13} />
                        {expandedListing === l.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </td>
                  </tr>
                  {expandedListing === l.id && (
                    <tr>
                      <td colSpan={9} style={{ background: '#f8fafc', padding: '14px 20px', borderBottom: '2px solid #10b981' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                          <div>
                            <h4 style={{ fontSize: 12, color: '#047857', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <User size={13} /> Farmer Details
                            </h4>
                            <div style={detailRow}><strong>Name:</strong> {l.farmer_name}</div>
                            <div style={detailRow}><strong>Email:</strong> {l.farmer_email}</div>
                            <div style={detailRow}><strong>Phone:</strong> {l.farmer_phone || '—'}</div>
                            <div style={detailRow}><strong>District:</strong> {l.farmer_district || '—'}</div>
                            <div style={detailRow}><strong>User ID:</strong> {l.farmer_user_id || '—'}</div>
                            <div style={detailRow}><strong>Status:</strong>
                              <span style={{
                                marginLeft: 4, padding: '1px 6px', borderRadius: 4, fontSize: 10,
                                background: l.farmer_status === 'Verified' ? '#dcfce7' : '#fef3c7',
                                color: l.farmer_status === 'Verified' ? '#166534' : '#92400e', fontWeight: 600
                              }}>
                                {l.farmer_status || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 style={{ fontSize: 12, color: '#047857', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Wheat size={13} /> Produce Details
                            </h4>
                            <div style={detailRow}><strong>Listing ID:</strong> L-{l.id}</div>
                            <div style={detailRow}><strong>Produce:</strong> {l.produce_name}</div>
                            <div style={detailRow}><strong>Kannada:</strong> {l.produce_name_kn || '—'}</div>
                            <div style={detailRow}><strong>Variety:</strong> {l.variety || '—'}</div>
                            <div style={detailRow}><strong>Category:</strong> {CATEGORY_LABELS[l.category_id] || l.category_id}</div>
                            <div style={detailRow}><strong>Produce ID:</strong> {l.produce_id || '—'}</div>
                          </div>
                          <div>
                            <h4 style={{ fontSize: 12, color: '#047857', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Tag size={13} /> Stock & Pricing
                            </h4>
                            <div style={detailRow}><strong>Available Stock:</strong> {l.quantity_kg.toLocaleString('en-IN')} kg</div>
                            <div style={detailRow}><strong>Price per kg:</strong> ₹{l.price_per_kg}</div>
                            <div style={detailRow}><strong>Total Value:</strong> ₹{(l.quantity_kg * l.price_per_kg).toLocaleString('en-IN')}</div>
                            <div style={detailRow}><strong>Listed On:</strong> {formatDate(l.created_at)}</div>
                            {l.image_url && (
                              <div style={{ marginTop: 8 }}>
                                <img src={l.image_url.startsWith('http') ? l.image_url : `http://localhost:8000${l.image_url}`}
                                  alt="Produce" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0' }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: '#92400e', color: '#fff' }}>
                <th style={thStyle}>#Order</th>
                <th style={thStyle}>Produce</th>
                <th style={thStyle}>Buyer</th>
                <th style={thStyle}>Seller (Farmer)</th>
                <th style={thStyle}>Qty (kg)</th>
                <th style={thStyle}>Total (₹)</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Payment ID</th>
                <th style={thStyle}>Date & Time</th>
                <th style={thStyle}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
                    {loading ? 'Loading orders…' : search ? 'No orders match your search.' : 'No orders found yet.'}
                  </td>
                </tr>
              ) : filteredOrders.map((o) => (
                <React.Fragment key={o.id}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fffbeb')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700, color: '#d97706' }}>ORD-{o.id}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{o.crop_name}</div>
                      {o.listing_variety && <div style={{ fontSize: 11, color: '#64748b' }}>{o.listing_variety}</div>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{o.buyer_name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>ID: {o.buyer_user_id}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{o.seller_name || '—'}</div>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>{o.quantity}</td>
                    <td style={{ ...tdStyle, fontWeight: 800, color: '#059669' }}>₹{o.total_price.toLocaleString('en-IN')}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: o.status === 'Confirmed' ? '#dcfce7' : o.status === 'Delivered' ? '#dbeafe' : '#fef3c7',
                        color: o.status === 'Confirmed' ? '#166534' : o.status === 'Delivered' ? '#1e40af' : '#92400e',
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 11, fontFamily: 'monospace', color: '#475569' }}>
                      {o.payment_id ? (o.payment_id.length > 18 ? o.payment_id.slice(0, 18) + '…' : o.payment_id) : '—'}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 11, color: '#64748b' }}>{formatDate(o.created_at)}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                        style={{
                          background: 'none', border: '1px solid #cbd5e1', borderRadius: 6,
                          padding: '4px 8px', cursor: 'pointer', color: '#475569', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4
                        }}
                      >
                        <Eye size={13} />
                        {expandedOrder === o.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === o.id && (
                    <tr>
                      <td colSpan={10} style={{ background: '#fffbeb', padding: '14px 20px', borderBottom: '2px solid #d97706' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                          <div>
                            <h4 style={{ fontSize: 12, color: '#d97706', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <ShoppingCart size={13} /> Buyer Details
                            </h4>
                            <div style={detailRow}><strong>Name:</strong> {o.buyer_name}</div>
                            <div style={detailRow}><strong>Email:</strong> {o.buyer_email}</div>
                            <div style={detailRow}><strong>Phone:</strong> {o.buyer_phone || '—'}</div>
                            <div style={detailRow}><strong>District:</strong> {o.buyer_district || '—'}</div>
                            <div style={detailRow}><strong>Buyer User ID:</strong> {o.buyer_user_id || '—'}</div>
                          </div>
                          <div>
                            <h4 style={{ fontSize: 12, color: '#047857', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <User size={13} /> Seller (Farmer) Details
                            </h4>
                            <div style={detailRow}><strong>Name:</strong> {o.seller_name || '—'}</div>
                            <div style={detailRow}><strong>Email:</strong> {o.seller_email || '—'}</div>
                            <div style={detailRow}><strong>Phone:</strong> {o.seller_phone || '—'}</div>
                            <div style={detailRow}><strong>District:</strong> {o.seller_district || '—'}</div>
                            <div style={detailRow}><strong>Listing ID:</strong> L-{o.listing_id}</div>
                            <div style={detailRow}><strong>Category:</strong> {CATEGORY_LABELS[o.listing_category] || o.listing_category || '—'}</div>
                          </div>
                          <div>
                            <h4 style={{ fontSize: 12, color: '#1e40af', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CreditCard size={13} /> Order & Payment
                            </h4>
                            <div style={detailRow}><strong>Order ID:</strong> ORD-{o.id}</div>
                            <div style={detailRow}><strong>Produce:</strong> {o.crop_name}</div>
                            <div style={detailRow}><strong>Variety:</strong> {o.listing_variety || '—'}</div>
                            <div style={detailRow}><strong>Quantity:</strong> {o.quantity} kg</div>
                            <div style={detailRow}><strong>Total Price:</strong> ₹{o.total_price.toLocaleString('en-IN')}</div>
                            <div style={detailRow}><strong>Payment ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{o.payment_id || '—'}</span></div>
                            <div style={detailRow}><strong>Status:</strong>
                              <span style={{
                                marginLeft: 4, padding: '1px 6px', borderRadius: 4, fontSize: 10,
                                background: o.status === 'Confirmed' ? '#dcfce7' : '#fef3c7',
                                color: o.status === 'Confirmed' ? '#166534' : '#92400e', fontWeight: 600
                              }}>
                                {o.status}
                              </span>
                            </div>
                            <div style={detailRow}><strong>Placed On:</strong> {formatDate(o.created_at)}</div>
                            {o.image_url && (
                              <div style={{ marginTop: 8 }}>
                                <img src={o.image_url.startsWith('http') ? o.image_url : `http://localhost:8000${o.image_url}`}
                                  alt="Produce" style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0' }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: 11.5,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  verticalAlign: 'middle',
};

const detailRow: React.CSSProperties = {
  fontSize: 12,
  color: '#334155',
  marginBottom: 3,
  lineHeight: 1.5,
};

