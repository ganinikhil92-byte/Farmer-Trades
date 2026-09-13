import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { MessageSquare, CheckCircle } from 'lucide-react';

interface Query {
  id: number;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
}

export default function QueriesList() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQueries() {
      try {
        const res = await api.get('/queries');
        setQueries(res.data);
      } catch {
        console.error('Failed to load queries');
      } finally {
        setLoading(false);
      }
    }
    fetchQueries();
  }, []);

  function markResolved(id: number) {
    setQueries((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'Resolved' } : q))
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <h2>User Queries & Support Tickets</h2>
            <p>Direct inquiries, mandi rate requests, and messages sent via the Contact Us form.</p>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading support inquiries...</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Submitted By</th>
                  <th>Email</th>
                  <th>Message / Query</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((q) => (
                  <tr key={q.id}>
                    <td>#{q.id}</td>
                    <td><strong>{q.name}</strong></td>
                    <td>{q.email}</td>
                    <td style={{ maxWidth: '320px' }}>{q.message}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{q.created_at}</td>
                    <td>
                      <span className={`badge ${q.status === 'Resolved' ? 'badge-green' : 'badge-warning'}`}>
                        {q.status}
                      </span>
                    </td>
                    <td>
                      {q.status !== 'Resolved' ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => markResolved(q.id)}
                        >
                          <CheckCircle size={14} /> Resolve
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Closed</span>
                      )}
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
