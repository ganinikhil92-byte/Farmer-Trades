import React from 'react';
import { MapPin, Navigation, Phone, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Full Karnataka APMC data keyed by district
const districtApmcs: Record<string, { name: string; address: string; phone: string; timing: string; topCrops: string[] }[]> = {
  'Bengaluru Urban': [
    { name: 'Yeshwanthpur APMC', address: 'Tumkur Road, Yeshwanthpur, Bengaluru – 560022', phone: '080-23375324', timing: '6 AM – 6 PM', topCrops: ['Tomato ₹28/kg', 'Onion ₹20/kg', 'Potato ₹18/kg'] },
    { name: 'KR Market (Krishnarajendra)', address: 'Krishna Rajendra Road, Bengaluru – 560002', phone: '080-22340151', timing: '5 AM – 7 PM', topCrops: ['Ragi ₹35/kg', 'Maize ₹24/kg', 'Banana ₹15/kg'] },
  ],
  'Bengaluru Rural': [
    { name: 'Doddaballapura APMC', address: 'NH 648, Doddaballapura – 561203', phone: '080-27663000', timing: '6 AM – 5 PM', topCrops: ['Silk Cocoon ₹450/kg', 'Tomato ₹26/kg', 'Beans ₹30/kg'] },
    { name: 'Devanahalli APMC', address: 'Devanahalli Town – 562110', phone: '08110-232234', timing: '6 AM – 4 PM', topCrops: ['Mango ₹40/kg', 'Grapes ₹60/kg'] },
  ],
  'Mysuru': [
    { name: 'Mysuru APMC', address: 'Mysore‑Ooty Road, Mysuru – 570010', phone: '0821-2480000', timing: '6 AM – 6 PM', topCrops: ['Ragi ₹35/kg', 'Paddy ₹22/kg', 'Turmeric ₹80/kg'] },
    { name: 'Nanjangud APMC', address: 'Nanjangud Town – 571301', phone: '08221-220025', timing: '7 AM – 5 PM', topCrops: ['Sugarcane ₹3.5/kg', 'Banana ₹12/kg'] },
  ],
  'Mandya': [
    { name: 'Mandya APMC', address: 'KM Road, Mandya – 571401', phone: '08232-222340', timing: '6 AM – 5 PM', topCrops: ['Sugarcane ₹3.8/kg', 'Paddy ₹23/kg', 'Coconut ₹22/piece'] },
  ],
  'Hassan': [
    { name: 'Hassan APMC', address: 'BM Road, Hassan – 573201', phone: '08172-268100', timing: '6 AM – 5 PM', topCrops: ['Coffee ₹220/kg', 'Arecanut ₹400/kg', 'Paddy ₹22/kg'] },
  ],
  'Shivamogga': [
    { name: 'Shivamogga APMC', address: 'NH 169, Shivamogga – 577201', phone: '08182-222345', timing: '6 AM – 5 PM', topCrops: ['Paddy ₹24/kg', 'Arecanut ₹420/kg', 'Banana ₹14/kg'] },
  ],
  'Dharwad': [
    { name: 'Dharwad APMC', address: 'Hubli Road, Dharwad – 580001', phone: '0836-2447001', timing: '6 AM – 6 PM', topCrops: ['Cotton ₹65/kg', 'Groundnut ₹55/kg', 'Jowar ₹32/kg'] },
  ],
  'Belagavi': [
    { name: 'Belagavi APMC', address: 'Station Road, Belagavi – 590001', phone: '0831-2422560', timing: '6 AM – 6 PM', topCrops: ['Sugarcane ₹3.6/kg', 'Cotton ₹66/kg', 'Soybean ₹45/kg'] },
  ],
  'Raichur': [
    { name: 'Raichur APMC', address: 'NH 50, Raichur – 584101', phone: '08532-228310', timing: '7 AM – 5 PM', topCrops: ['Paddy ₹22/kg', 'Cotton ₹64/kg', 'Jowar ₹30/kg'] },
  ],
  'Ballari': [
    { name: 'Ballari APMC', address: 'Sandur Road, Ballari – 583101', phone: '08392-256900', timing: '6 AM – 5 PM', topCrops: ['Groundnut ₹56/kg', 'Cotton ₹65/kg', 'Onion ₹18/kg'] },
  ],
  'Kalaburagi': [
    { name: 'Kalaburagi APMC', address: 'Sedam Road, Kalaburagi – 585101', phone: '08472-224500', timing: '6 AM – 6 PM', topCrops: ['Tur Dal ₹95/kg', 'Gram ₹70/kg', 'Cotton ₹65/kg'] },
  ],
  'Vijayapura': [
    { name: 'Vijayapura APMC', address: 'Solapur Road, Vijayapura – 586101', phone: '08352-255000', timing: '6 AM – 6 PM', topCrops: ['Pomegranate ₹70/kg', 'Grapes ₹55/kg', 'Sunflower ₹52/kg'] },
  ],
  'Tumakuru': [
    { name: 'Tumakuru APMC', address: 'NH 4, Tumakuru – 572101', phone: '0816-2277000', timing: '6 AM – 5 PM', topCrops: ['Coconut ₹20/piece', 'Groundnut ₹54/kg', 'Ragi ₹33/kg'] },
  ],
  'Dakshina Kannada': [
    { name: 'Mangaluru APMC', address: 'Balmatta Road, Mangaluru – 575001', phone: '0824-2440000', timing: '6 AM – 6 PM', topCrops: ['Arecanut ₹410/kg', 'Coconut ₹25/piece', 'Pepper ₹350/kg'] },
  ],
  'Udupi': [
    { name: 'Udupi APMC', address: 'Manipal Road, Udupi – 576101', phone: '0820-2524100', timing: '6 AM – 5 PM', topCrops: ['Arecanut ₹400/kg', 'Coconut ₹24/piece', 'Paddy ₹23/kg'] },
  ],
  'Uttara Kannada': [
    { name: 'Karwar APMC', address: 'NH 66, Karwar – 581301', phone: '08382-226500', timing: '7 AM – 5 PM', topCrops: ['Cashew ₹120/kg', 'Coconut ₹22/piece', 'Arecanut ₹380/kg'] },
  ],
  'Chikkamagaluru': [
    { name: 'Chikkamagaluru APMC', address: 'Kadur Road, Chikkamagaluru – 577101', phone: '08262-233000', timing: '6 AM – 5 PM', topCrops: ['Coffee ₹230/kg', 'Pepper ₹340/kg', 'Arecanut ₹420/kg'] },
  ],
  'Kodagu': [
    { name: 'Madikeri APMC', address: 'Mysuru Road, Madikeri – 571201', phone: '08272-225300', timing: '7 AM – 5 PM', topCrops: ['Coffee ₹240/kg', 'Pepper ₹360/kg', 'Cardamom ₹1500/kg'] },
  ],
  'Chamarajanagara': [
    { name: 'Chamarajanagara APMC', address: 'Mysuru Road, Chamarajanagara – 571313', phone: '08226-222100', timing: '6 AM – 5 PM', topCrops: ['Paddy ₹22/kg', 'Ragi ₹34/kg', 'Sandalwood ₹8000/kg'] },
  ],
  'Ramanagara': [
    { name: 'Ramanagara APMC', address: 'Bengaluru‑Mysuru Rd, Ramanagara – 562159', phone: '08027-272100', timing: '6 AM – 5 PM', topCrops: ['Silk Cocoon ₹480/kg', 'Ragi ₹33/kg', 'Tomato ₹25/kg'] },
  ],
  'Chikkaballapura': [
    { name: 'Chikkaballapura APMC', address: 'NH 648, Chikkaballapura – 562101', phone: '08156-272200', timing: '6 AM – 5 PM', topCrops: ['Tomato ₹27/kg', 'Beans ₹35/kg', 'Carrot ₹28/kg'] },
  ],
  'Kolar': [
    { name: 'Kolar APMC', address: 'Bangarpet Road, Kolar – 563101', phone: '08152-222500', timing: '6 AM – 5 PM', topCrops: ['Tomato ₹26/kg', 'Potato ₹17/kg', 'Onion ₹19/kg'] },
  ],
  'Chitradurga': [
    { name: 'Chitradurga APMC', address: 'NH 48, Chitradurga – 577501', phone: '08194-234500', timing: '6 AM – 5 PM', topCrops: ['Groundnut ₹55/kg', 'Sunflower ₹50/kg', 'Cotton ₹63/kg'] },
  ],
  'Davanagere': [
    { name: 'Davanagere APMC', address: 'Harihara Road, Davanagere – 577001', phone: '08192-231100', timing: '6 AM – 5 PM', topCrops: ['Cotton ₹65/kg', 'Maize ₹25/kg', 'Paddy ₹22/kg'] },
  ],
  'Haveri': [
    { name: 'Haveri APMC', address: 'Bypass Road, Haveri – 581110', phone: '08375-240000', timing: '6 AM – 5 PM', topCrops: ['Cotton ₹66/kg', 'Chilli ₹110/kg', 'Sunflower ₹52/kg'] },
  ],
  'Gadag': [
    { name: 'Gadag APMC', address: 'Station Road, Gadag – 582101', phone: '08372-234000', timing: '6 AM – 5 PM', topCrops: ['Cotton ₹65/kg', 'Jowar ₹32/kg', 'Wheat ₹28/kg'] },
  ],
  'Koppal': [
    { name: 'Koppal APMC', address: 'Gangavathi Road, Koppal – 583231', phone: '08539-220500', timing: '6 AM – 5 PM', topCrops: ['Paddy ₹23/kg', 'Cotton ₹64/kg', 'Groundnut ₹55/kg'] },
  ],
  'Bidar': [
    { name: 'Bidar APMC', address: 'Udgir Road, Bidar – 585401', phone: '08482-229900', timing: '6 AM – 5 PM', topCrops: ['Tur Dal ₹96/kg', 'Gram ₹72/kg', 'Soybean ₹46/kg'] },
  ],
  'Yadgir': [
    { name: 'Yadgir APMC', address: 'Shorapur Road, Yadgir – 585201', phone: '08473-252300', timing: '7 AM – 5 PM', topCrops: ['Tur Dal ₹94/kg', 'Groundnut ₹53/kg', 'Cotton ₹63/kg'] },
  ],
  'Bagalkote': [
    { name: 'Bagalkote APMC', address: 'Vijayapura Road, Bagalkote – 587101', phone: '08354-235000', timing: '6 AM – 5 PM', topCrops: ['Grapes ₹58/kg', 'Pomegranate ₹68/kg', 'Sugarcane ₹3.7/kg'] },
  ],
};

// Fallback: show all when district is unknown
const allApmcs = Object.entries(districtApmcs).flatMap(([district, list]) =>
  list.map((a) => ({ ...a, district }))
);

export default function NearestAPMC() {
  const { user } = useAuth();
  const userDistrict = user?.district || '';
  const userTaluk = user?.taluk || '';
  const userVillage = user?.village || '';
  const userPincode = user?.pincode || '';

  const localApmcs = userDistrict && districtApmcs[userDistrict]
    ? districtApmcs[userDistrict].map((a) => ({ ...a, district: userDistrict }))
    : allApmcs.slice(0, 6);

  const isPersonalized = !!(userDistrict && districtApmcs[userDistrict]);

  // Build a precise location string
  const locationParts = [
    userVillage || null,
    userTaluk || null,
    userDistrict || null,
    'Karnataka',
  ].filter(Boolean);
  const locationLabel = locationParts.join(', ');

  return (
    <div>
      <div className="page-header">
        <h1>Nearest APMC Mandi</h1>
        <p>
          {isPersonalized
            ? `Showing APMC markets near ${locationLabel}${userPincode ? ` – ${userPincode}` : ''}`
            : 'Find the closest agricultural produce markets in Karnataka'}
        </p>
      </div>

      {/* Location info banner */}
      {isPersonalized ? (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1.5px solid #86efac',
          borderRadius: '0.875rem',
          padding: '0.875rem 1.25rem',
          marginBottom: '1.5rem',
          fontWeight: 500, color: '#166534',
        }}>
          <Navigation size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div>📍 Your location: <strong>{locationLabel}</strong>{userPincode && <> &nbsp;·&nbsp; Pincode: <strong>{userPincode}</strong></>}</div>
            {userVillage && (
              <div style={{ fontSize: '0.82rem', fontWeight: 400, marginTop: '0.25rem', color: '#166534' }}>
                🏘 Village: <strong>{userVillage}</strong> · Taluk: <strong>{userTaluk}</strong> · District: <strong>{userDistrict}</strong>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#fff7ed', border: '1.5px solid #fed7aa',
          borderRadius: '0.875rem', padding: '0.875rem 1.25rem',
          marginBottom: '1.5rem', color: '#9a3412', fontSize: '0.9rem',
        }}>
          ⚠️ District not set in your profile. Showing general Karnataka APMCs.
          <strong> Re-register</strong> to get personalised results.
        </div>
      )}

      {/* Mock map */}
      <div className="card" style={{
        height: 240,
        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 30px,#065f46 30px,#065f46 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,#065f46 30px,#065f46 31px)',
        }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <MapPin size={44} style={{ color: 'var(--color-primary-700)', marginBottom: '0.5rem' }} />
          <p style={{ fontWeight: 600, color: 'var(--color-primary-800)' }}>
            Karnataka Map — Google Maps integration will appear here
          </p>
          <p style={{ color: 'var(--color-primary-600)', fontSize: '0.875rem' }}>
            {isPersonalized ? `Centred on ${userDistrict}` : 'Provide a Google Maps API key to enable'}
          </p>
        </div>
      </div>

      {/* APMC cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {localApmcs.map((m) => (
          <div key={m.name} className="card animate-fadeIn" style={{ borderLeft: '4px solid var(--color-primary-400)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <MapPin size={18} style={{ color: 'var(--color-primary-600)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.15rem' }}>{m.name}</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{m.district}, Karnataka</p>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.5rem' }}>
              📍 {m.address}
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: '#475569' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Phone size={13} /> {m.phone}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={13} /> {m.timing}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {m.topCrops.map((crop) => (
                <span key={crop} className="badge badge-amber" style={{ fontSize: '0.75rem' }}>{crop}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
