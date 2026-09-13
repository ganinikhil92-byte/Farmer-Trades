import React, { useEffect, useState, FormEvent } from 'react';
import api from '../../utils/api';
import { Plus, Trash2 } from 'lucide-react';

interface Item {
  id: number;
  name: string;
}

interface ManageListProps {
  title: string;
  endpoint: string; // e.g. "crops", "vegetables", "fruits"
  icon: React.ReactNode;
}

export default function ManageList({ title, endpoint, icon }: ManageListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    api.get(`/${endpoint}`)
      .then((res) => {
        if (!ignore) setItems(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch', err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [endpoint]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await api.post(`/${endpoint}`, { name: newName.trim() });
      setItems([...items, res.data]);
      setNewName('');
    } catch {
      alert('Failed to add');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(`Delete this ${title.slice(0, -1).toLowerCase()}?`)) return;
    try {
      await api.delete(`/${endpoint}/${id}`);
      setItems(items.filter((i) => i.id !== id));
    } catch {
      alert('Failed to delete');
    }
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {icon}
        <div>
          <h1>Manage {title}</h1>
          <p>Add or remove {title.toLowerCase()} from the master list</p>
        </div>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label">New {title.slice(0, -1)}</label>
          <input className="input" placeholder={`Enter ${title.slice(0, -1).toLowerCase()} name`} value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">
          <Plus size={18} /> Add
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="animate-pulse">Loading…</div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Name</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No {title.toLowerCase()} found. Add one above.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
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
