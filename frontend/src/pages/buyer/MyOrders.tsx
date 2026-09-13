import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  ShoppingBag,
  ShoppingCart,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Scale,
  IndianRupee
} from 'lucide-react';

interface OrderItem {
  id: number;
  listing_id: number;
  buyer_id: string;
  crop_name?: string;
  quantity: number;
  total_price: number;
}

const PHOTO_MAP: Record<string, string> = {
  // Crops
  'ragi (finger millet)': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
  'paddy (rice)': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
  'jowar (sorghum)': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
  'maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop',
  'sugarcane': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop',
  'wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
  'rice': 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
  // Vegetables
  'tomato': 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=300&fit=crop',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82b8efd8?w=400&h=300&fit=crop',
  'onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop',
  'brinjal': 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&h=300&fit=crop',
  'green chilli': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&h=300&fit=crop',
  'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
  'cabbage': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=300&fit=crop',
  // Fruits
  'mango (alphonso)': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
  'sapota (chikoo)': 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&h=300&fit=crop',
  'pomegranate': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop',
  'jackfruit': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop',
  'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
  'grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=300&fit=crop',
  'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop',
};

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop';

function getPhoto(name?: string): string {
  if (!name) return DEFAULT_PHOTO;
  const lower = name.toLowerCase();
  if (PHOTO_MAP[lower]) return PHOTO_MAP[lower];
  for (const [key, url] of Object.entries(PHOTO_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return url;
  }
  return DEFAULT_PHOTO;
}

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    const buyerParam = user?.email ? `?buyer_id=${encodeURIComponent(user.email)}` : '';
    Promise.all([
      api.get(`/orders${buyerParam}`).catch(() => ({ data: [] })),
      api.get('/listings').catch(() => ({ data: [] }))
    ])
      .then(([ordersRes, listingsRes]) => {
        if (ignore) return;
        const listingMap: Record<number, string> = {};
        (listingsRes.data || []).forEach((l: any) => {
          if (l && l.id) listingMap[l.id] = l.crop_name;
        });

        const enriched = (ordersRes.data as OrderItem[]).map((o) => ({
          ...o,
          crop_name: o.crop_name || listingMap[o.listing_id] || `Listing #${o.listing_id}`
        }));

        // Sort newest first
        enriched.sort((a, b) => b.id - a.id);
        setOrders(enriched);
      })
      .catch(() => {
        if (!ignore) setOrders([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [user?.email, refreshTrigger]);

  const totalQuantity = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
  const totalSpent = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>My Orders</h1>
          <p>Track all your crop, vegetable, and fruit purchases</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setLoading(true);
              setRefreshTrigger((prev) => prev + 1);
            }}
            title="Refresh orders"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <Link
            to="/buyer/buy"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ShoppingCart size={14} /> Buy More Produce
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="stagger"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Total Orders
            </span>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {orders.length}
            </h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Scale size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Total Quantity
            </span>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
              {totalQuantity.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>kg</span>
            </h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#fefce8',
              color: '#ca8a04',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IndianRupee size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Total Amount
            </span>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary-700)' }}>
              ₹{totalSpent.toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      {/* Orders Content */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--color-text-muted)' }}>
          <RefreshCw size={36} className="spin" style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--color-gray-100)',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Package size={36} />
          </div>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>No Orders Found</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: 420, margin: '0 auto 1.5rem' }}>
            You haven't placed any orders yet. Browse through our fresh crops, vegetables, and fruits to get started!
          </p>
          <Link to="/buyer/buy" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={16} /> Browse Produce <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Order ID</th>
                <th>Produce Item</th>
                <th style={{ textAlign: 'center' }}>Quantity (kg)</th>
                <th style={{ textAlign: 'right' }}>Total Price</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const itemName = o.crop_name || 'Produce Item';
                const photoUrl = getPhoto(itemName);
                const unitPrice = o.quantity > 0 ? (o.total_price / o.quantity).toFixed(0) : '-';

                return (
                  <tr key={o.id}>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: 'var(--color-primary-700)',
                          background: 'var(--color-primary-50, #f0fdf4)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 6,
                          letterSpacing: '0.02em',
                        }}
                      >
                        #ORD-{String(o.id).padStart(4, '0')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img
                          src={photoUrl}
                          alt={itemName}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            objectFit: 'cover',
                            border: '1px solid var(--color-border)',
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_PHOTO;
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                            {itemName}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Rate: ₹{unitPrice} / kg
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '999px',
                          background: '#f1f5f9',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: '#334155',
                        }}
                      >
                        {o.quantity} kg
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary-700)' }}>
                        ₹{o.total_price.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className="badge badge-green"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={13} /> Placed
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.8rem',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        <Clock size={13} /> Processing
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
