import React, { useState } from 'react';
import { useAuth, AuthUser, UserStatus } from '../../context/AuthContext';
import {
  ShoppingBag,
  CheckCircle,
  ShieldAlert,
  MapPin,
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  Phone
} from 'lucide-react';
import { KARNATAKA_DISTRICTS } from '../../data/karnatakaLocations';

export default function CustomersList() {
  const { getUsers, updateUserStatus, updateUserDetails, deleteUser } = useAuth();
  const buyers = getUsers('buyer');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Edit modal state
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    phone: string;
    district: string;
    taluk: string;
    village: string;
    pincode: string;
    status: UserStatus;
  }>({
    name: '',
    phone: '',
    district: '',
    taluk: '',
    village: '',
    pincode: '',
    status: 'Verified',
  });

  const filteredBuyers = buyers.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.taluk && b.taluk.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.village && b.village.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.pincode && b.pincode.includes(searchTerm));

    const matchesDistrict = !selectedDistrict || b.district === selectedDistrict;

    return matchesSearch && matchesDistrict;
  });

  function handleOpenEdit(b: AuthUser) {
    setEditingUser(b);
    setEditForm({
      name: b.name,
      phone: b.phone || '',
      district: b.district || '',
      taluk: b.taluk || '',
      village: b.village || '',
      pincode: b.pincode || '',
      status: b.status || 'Verified',
    });
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    updateUserDetails(editingUser.email, editForm);
    updateUserStatus(editingUser.email, editForm.status);
    setEditingUser(null);
  }

  function handleDelete(email: string, name: string) {
    if (window.confirm(`Are you sure you want to remove buyer "${name}" (${email})?`)) {
      deleteUser(email);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--color-primary-700)', background: 'var(--color-primary-100)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <h2>Manage Registered Buyers / Traders (Karnataka)</h2>
            <p>Review, verify, update, and manage wholesale buyers, retailers, and traders in Karnataka.</p>
          </div>
        </div>
        <div>
          <span className="badge badge-blue" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
            {buyers.length} Total Buyers
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-with-icon" style={{ flex: '1 1 250px' }}>
            <Search size={18} />
            <input
              type="text"
              className="input"
              placeholder="Search by buyer name, email, taluk, village, or pincode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="input-with-icon" style={{ minWidth: '220px' }}>
            <Filter size={18} />
            <select
              className="input"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">All Karnataka Districts ({KARNATAKA_DISTRICTS.length})</option>
              {KARNATAKA_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedDistrict) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setSearchTerm(''); setSelectedDistrict(''); }}
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Buyers Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredBuyers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600 }}>No registered buyers match your filters</p>
            <p style={{ fontSize: '0.875rem' }}>
              {searchTerm || selectedDistrict
                ? 'Try resetting the district or search keyword.'
                : 'Buyers who register via the portal will appear here.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Buyer Name & Contact</th>
                  <th>Email</th>
                  <th>Location (Karnataka)</th>
                  <th>Pincode</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Admin Management</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuyers.map((buyer, i) => (
                  <tr key={buyer.email}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>#{i + 1}</td>
                    <td>
                      <div>
                        <strong>{buyer.name}</strong>
                        {buyer.phone && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                            <Phone size={12} /> {buyer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{buyer.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                        <MapPin size={14} style={{ color: 'var(--color-primary-600)', marginTop: 2, flexShrink: 0 }} />
                        <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                          {buyer.village && <span style={{ fontWeight: 500 }}>{buyer.village}, </span>}
                          {buyer.taluk && <span>{buyer.taluk} Taluk, </span>}
                          <span style={{ fontWeight: 600 }}>{buyer.district || '—'}</span>
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Karnataka State</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{buyer.pincode || '—'}</td>
                    <td>
                      <span className={`badge ${buyer.status === 'Verified' ? 'badge-green' : buyer.status === 'Pending' ? 'badge-amber' : 'badge-red'}`}>
                        {buyer.status || 'Verified'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        {buyer.status === 'Verified' ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                            onClick={() => updateUserStatus(buyer.email, 'Suspended')}
                            title="Suspend buyer account"
                          >
                            <ShieldAlert size={14} color="#dc2626" /> Suspend
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                            onClick={() => updateUserStatus(buyer.email, 'Verified')}
                            title="Verify and approve buyer"
                          >
                            <CheckCircle size={14} /> Verify
                          </button>
                        )}

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                          onClick={() => handleOpenEdit(buyer)}
                          title="Edit buyer information"
                        >
                          <Edit2 size={14} /> Edit
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.5rem', color: '#dc2626' }}
                          onClick={() => handleDelete(buyer.email, buyer.name)}
                          title="Delete buyer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Buyer Modal */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div className="card animate-scaleIn" style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Edit Buyer Information</h3>
              <button onClick={() => setEditingUser(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Buyer / Business Name</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email (Identifier)</label>
                <input
                  type="email"
                  className="input"
                  value={editingUser.email}
                  disabled
                  style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. 9845012345"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">District (Karnataka)</label>
                <select
                  className="input"
                  value={editForm.district}
                  onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                >
                  <option value="">Select District</option>
                  {KARNATAKA_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Taluk</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.taluk}
                  onChange={(e) => setEditForm({ ...editForm, taluk: e.target.value })}
                  placeholder="Taluk name"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Village / Town / Market Area</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.village}
                  onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                  placeholder="Town or market area"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  className="input"
                  value={editForm.pincode}
                  onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Status</label>
                <select
                  className="input"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as UserStatus })}
                >
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
