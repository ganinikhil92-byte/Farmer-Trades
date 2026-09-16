import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Salad } from 'lucide-react';
import { getProduceImage, FALLBACK_PHOTOS } from '../../utils/producePhoto';

interface Listing {
  id: number | string;
  category: string;
  crop_name: string;
  crop_type: string;
  quantity_kg: number;
  price_per_kg: number;
  farmer_id: string;
  image_url?: string;
}

export default function VegetableStocks() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/listings?category=vegetable').then((res) => {
      setListings(res.data as Listing[]);
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
                <th>Photo</th>
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
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No vegetable listings yet.</td></tr>
              ) : (
                listings.map((l, i) => (
                  <tr key={l.id}>
                    <td>{i + 1}</td>
                    <td style={{ width: '70px', padding: '0.4rem 0.6rem' }}>
                      <img
                        src={getProduceImage(l.crop_name, l.category, l.image_url)}
                        alt={l.crop_name}
                        style={{
                          width: '52px',
                          height: '52px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          display: 'block',
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_PHOTOS.vegetable;
                        }}
                      />
                    </td>
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
