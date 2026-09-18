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
import { resolveOrderImage, handleImageError } from '../../utils/producePhoto';

interface OrderItem {
  id: number;
  listing_id: number;
  buyer_id: string;
  crop_name?: string;
  image_url?: string;
  quantity: number;
  total_price: number;
}

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [listingsMap, setListingsMap] = useState<Record<string | number, any>>({});
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
        const listingsById: Record<string | number, any> = {};
        (listingsRes.data || []).forEach((l: any) => {
          if (l && l.id !== undefined) {
            listingsById[l.id] = l;
            listingsById[String(l.id)] = l;
          }
        });

        const enriched = (ordersRes.data as OrderItem[]).map((o) => ({
          ...o,
          crop_name: o.crop_name || listingsById[o.listing_id]?.crop_name || `Listing #${o.listing_id}`
        }));

        // Sort newest first
        enriched.sort((a, b) => b.id - a.id);
        setOrders(enriched);
        setListingsMap(listingsById);
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
                const imgRes = resolveOrderImage(o, listingsMap);
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
                        <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                          <img
                            src={imgRes.url}
                            alt={itemName}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              objectFit: 'cover',
                              border: '1px solid var(--color-border)',
                              display: 'block',
                            }}
                            onError={handleImageError}
                          />
                          {imgRes.isSellerProvided ? (
                            <span
                              title="Seller-provided photo"
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(22, 101, 52, 0.9)',
                                color: '#fff',
                                fontSize: '0.55rem',
                                padding: '1px 2px',
                                textAlign: 'center',
                                borderBottomLeftRadius: 8,
                                borderBottomRightRadius: 8,
                                lineHeight: 1.1,
                              }}
                            >
                              Photo
                            </span>
                          ) : (
                            <span
                              title="No photo uploaded"
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(100, 116, 139, 0.85)',
                                color: '#fff',
                                fontSize: '0.5rem',
                                padding: '1px 2px',
                                textAlign: 'center',
                                borderBottomLeftRadius: 8,
                                borderBottomRightRadius: 8,
                                lineHeight: 1.1,
                              }}
                            >
                              No photo
                            </span>
                          )}
                        </div>
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
