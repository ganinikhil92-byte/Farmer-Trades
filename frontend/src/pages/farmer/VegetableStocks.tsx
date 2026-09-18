import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Salad, Camera } from 'lucide-react';
import { resolveProduceImage, handleImageError } from '../../utils/producePhoto';
import { useAuth } from '../../context/AuthContext';
import ListingPhotoModal from '../../components/ListingPhotoModal';

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
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoModalListing, setPhotoModalListing] = useState<Listing | null>(null);

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No vegetable listings yet.</td></tr>
              ) : (
                listings.map((l, i) => {
                  const imgRes = resolveProduceImage({
                    name: l.crop_name,
                    category: l.category,
                    imageUrl: l.image_url,
                  });
                  const isOwner = user?.email && l.farmer_id && (l.farmer_id.toLowerCase() === user.email.toLowerCase() || user.role === 'admin');

                  return (
                    <tr key={l.id}>
                      <td>{i + 1}</td>
                      <td style={{ width: '70px', padding: '0.4rem 0.6rem' }}>
                        <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                          <img
                            src={imgRes.url}
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
                      </td>
                      <td style={{ fontWeight: 600 }}>{l.crop_name}</td>
                      <td>{l.crop_type || '—'}</td>
                      <td>{l.quantity_kg}</td>
                      <td>₹{l.price_per_kg}</td>
                      <td style={{ fontWeight: 600 }}>₹{(l.quantity_kg * l.price_per_kg).toLocaleString()}</td>
                      <td><span className={`badge ${l.quantity_kg > 0 ? 'badge-green' : 'badge-red'}`}>{l.quantity_kg > 0 ? 'In Stock' : 'Sold Out'}</span></td>
                      <td>
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => setPhotoModalListing(l)}
                            className="btn btn-secondary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            title="Update or add photo for this listing"
                          >
                            <Camera size={13} /> {l.image_url ? 'Change Photo' : 'Add Photo'}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {photoModalListing && (
        <ListingPhotoModal
          listing={photoModalListing}
          isOpen={Boolean(photoModalListing)}
          onClose={() => setPhotoModalListing(null)}
          onSuccess={(listingId, newImageUrl) => {
            setListings((prev) =>
              prev.map((item) => (String(item.id) === String(listingId) ? { ...item, image_url: newImageUrl } : item))
            );
          }}
        />
      )}
    </div>
  );
}
