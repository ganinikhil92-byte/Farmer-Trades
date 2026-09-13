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
                  <th>Quantity (KG)</th>
                  <th>Total Amount</th>
                  <th>Buyer</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#ORD-KA-{o.id}</td>
                    <td><strong>{o.crop_name}</strong></td>
                    <td>{o.quantity} KG</td>
                    <td><strong>₹{o.total_price.toLocaleString()}</strong></td>
                    <td>{o.buyer_id}</td>
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

