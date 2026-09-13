import React from 'react';
import { Newspaper, Calendar, ExternalLink, Tag } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  category: string;
  date: string;
  summary: string;
  source: string;
}

const karnatakaNews: NewsItem[] = [
  {
    id: 1,
    title: 'Karnataka Cabinet approves ₹300/quintal bonus over MSP for Ragi and Jowar',
    category: 'Government Policy & MSP',
    date: 'Sep 08, 2026',
    summary: 'The Karnataka state government announced an additional procurement incentive bonus for farmers registering their produce through designated APMC mandi centers across South and North Karnataka.',
    source: 'Dept of Agriculture, Govt of Karnataka'
  },
  {
    id: 2,
    title: 'Yeshwanthpur APMC implements electronic auctioning for Tomatoes and Onions',
    category: 'Mandi Reforms',
    date: 'Sep 06, 2026',
    summary: 'Electronic weighing scales and digital e-tender terminals are now live at Yeshwanthpur market yard to ensure instant payment settlement and eliminate middlemen commissions.',
    source: 'Karnataka State APMC Federation'
  },
  {
    id: 3,
    title: 'University of Agricultural Sciences (UAS) Bangalore releases drought-hardy Ragi ML-365',
    category: 'Crop Science',
    date: 'Aug 29, 2026',
    summary: 'A high-yielding, blast-resistant finger millet variety designed specifically for dryland farming in Kolar, Mandya, Tumakuru, and Chikkaballapur has been approved for state-wide distribution.',
    source: 'UAS GKVK Bangalore'
  },
  {
    id: 4,
    title: 'Solar pump subsidy applications opened under PM-KUSUM Component B in Karnataka',
    category: 'Subsidies & Grants',
    date: 'Aug 25, 2026',
    summary: 'Karnataka Renewable Energy Development Ltd (KREDL) invites online applications for 7.5 HP off-grid solar irrigation pumps with 80% combined state and central financial assistance.',
    source: 'KREDL Portal Karnataka'
  }
];

export default function NewsFeed() {
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Newspaper size={22} />
          </div>
          <div>
            <h2>Karnataka Agri News & MSP Bulletins</h2>
            <p>Official announcements, mandi rate notifications, and agricultural research updates.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {karnatakaNews.map((item) => (
          <div key={item.id} className="card" style={{ transition: 'all 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} /> {item.category}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {item.date}
              </span>
            </div>

            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: 'var(--text-main)' }}>{item.title}</h3>
            <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.summary}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Source: {item.source}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => alert(`Opening press release: ${item.title}`)}
              >
                Read Bulletin <ExternalLink size={14} style={{ marginLeft: '4px' }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
