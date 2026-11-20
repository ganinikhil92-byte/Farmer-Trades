import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { History } from 'lucide-react';

interface Order {
  id: number;
  listing_id: number;
  crop_name: string;
  quantity: number;
  total_price: number;
  buyer_id: string;
  status?: string;
  payment_id?: string;
  created_at?: string;
}

export default function SellingHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch {
        console.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <History size={22} />
          </div>
          <div>
            <h2>Selling History</h2>
            <p>Your completed sales when buyers purchase your listed produce.</p>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading selling history...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <History size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>No sales yet.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>When a buyer purchases your listed produce, the sale will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Crop Sold</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Buyer Account</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><strong style={{ fontFamily: 'monospace', color: '#166534' }}>#ORD-KA-{o.id}</strong></td>
                    <td><strong>{o.crop_name}</strong></td>
                    <td>{o.quantity} KG</td>
                    <td><strong style={{ color: '#047857' }}>₹{o.total_price.toLocaleString('en-IN')}</strong></td>
                    <td><span style={{ fontSize: '0.85rem', color: '#475569' }}>{o.buyer_id}</span></td>
                    <td><code style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: 4 }}>{o.payment_id || 'pay_online'}</code></td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: o.status === 'Delivered' ? '#dcfce7' : o.status === 'In Transit' ? '#fef3c7' : '#e0f2fe',
                        color: o.status === 'Delivered' ? '#15803d' : o.status === 'In Transit' ? '#b45309' : '#0369a1'
                      }}>
                        {o.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

