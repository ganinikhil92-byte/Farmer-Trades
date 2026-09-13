import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Package, Search, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Listing {
  id: number;
  crop_name: string;
  quantity_kg: number;
  price_per_kg: number;
  farmer_id: string;
}

export default function BuyerStocks() {
  const [stocks, setStocks] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStocks() {
      try {
        const res = await api.get('/listings');
        setStocks(res.data);
      } catch {
        console.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    }
    fetchStocks();
  }, []);

  const filtered = stocks.filter((s) =>
    s.crop_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Package size={22} />
          </div>
          <div>
            <h2>Available Crop Stocks in Karnataka</h2>
            <p>Live inventory quantities in kilograms available for direct purchase from Karnataka farmers.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.25rem' }}>
          <div className="input-with-icon">
            <Search size={18} />
            <input
              className="input"
              type="text"
              placeholder="Search crop name (e.g., Ragi, Paddy, Jowar)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading live crop availability...</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop Name</th>
                  <th>Quantity Available (KG)</th>
                  <th>Direct Farmer Price (₹ / KG)</th>
                  <th>Origin</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.crop_name}</strong></td>
                    <td>
                      <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{item.quantity_kg} KG</span>
                    </td>
                    <td>₹{item.price_per_kg} / KG</td>
                    <td>Karnataka Direct Farm</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/buyer/buy')}
                      >
                        <ShoppingCart size={14} style={{ marginRight: '4px' }} /> Buy Now
                      </button>
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
