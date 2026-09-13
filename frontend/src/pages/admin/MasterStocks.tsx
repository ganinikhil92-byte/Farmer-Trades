import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Package, Search } from 'lucide-react';

interface Listing {
  id: number;
  crop_name: string;
  quantity_kg: number;
  price_per_kg: number;
  farmer_id: string;
}

export default function MasterStocks() {
  const [stocks, setStocks] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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
    s.crop_name.toLowerCase().includes(search.toLowerCase()) ||
    s.farmer_id.toLowerCase().includes(search.toLowerCase())
  );

  const totalKg = stocks.reduce((acc, curr) => acc + curr.quantity_kg, 0);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Package size={22} />
          </div>
          <div>
            <h2>Karnataka Master Crop Stock Inventory</h2>
            <p>Live inventory quantities across registered Karnataka farmers.</p>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card card">
          <span className="stat-card-label">Total Available Produce</span>
          <span className="stat-card-num">{totalKg.toLocaleString()} KG</span>
        </div>
        <div className="stat-card card">
          <span className="stat-card-label">Active Crop Batches</span>
          <span className="stat-card-num">{stocks.length}</span>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
          <div className="input-with-icon">
            <Search size={18} />
            <input
              className="input"
              type="text"
              placeholder="Search crop name or farmer email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading live crop stocks...</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Crop Name</th>
                  <th>Quantity Available</th>
                  <th>Base Price (₹/KG)</th>
                  <th>Farmer Account</th>
                  <th>Stock Health</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td><strong>{item.crop_name}</strong></td>
                    <td><strong>{item.quantity_kg} KG</strong></td>
                    <td>₹{item.price_per_kg} / KG</td>
                    <td>{item.farmer_id}</td>
                    <td>
                      <span className={`badge ${item.quantity_kg > 100 ? 'badge-green' : item.quantity_kg > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {item.quantity_kg > 100 ? 'Ample Stock' : item.quantity_kg > 0 ? 'Low Stock' : 'Out of Stock'}
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
