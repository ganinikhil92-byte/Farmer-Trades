import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Salad } from 'lucide-react';

interface Listing {
  id: number;
  category: string;
  crop_name: string;
  crop_type: string;
  quantity_kg: number;
  price_per_kg: number;
  farmer_id: string;
}

export default function VegetableStocks() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/listings?category=vegetable').then((res) => {
      // Deduplicate by crop_name — keep only the first listing for each unique vegetable
      const seen = new Set<string>();
      const unique = (res.data as Listing[]).filter((l) => {
        if (seen.has(l.crop_name)) return false;
        seen.add(l.crop_name);
        return true;
      });
      setListings(unique);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Salad size={28} style={{ color: '#16a34a' }} /> Vegetable Stocks
        </h1>
        <p>Your current vegetable inventory and active listings</p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><div className="animate-pulse">Loading…</div></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Vegetable Name</th>
                <th>Type</th>
                <th>Quantity (kg)</th>
                <th>Price / kg</th>
                <th>Total Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No vegetable listings yet.</td></tr>
              ) : (
                listings.map((l, i) => (
                  <tr key={l.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{l.crop_name}</td>
                    <td>{l.crop_type || '—'}</td>
                    <td>{l.quantity_kg}</td>
                    <td>₹{l.price_per_kg}</td>
                    <td style={{ fontWeight: 600 }}>₹{(l.quantity_kg * l.price_per_kg).toLocaleString()}</td>
                    <td><span className={`badge ${l.quantity_kg > 0 ? 'badge-green' : 'badge-red'}`}>{l.quantity_kg > 0 ? 'In Stock' : 'Sold Out'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
