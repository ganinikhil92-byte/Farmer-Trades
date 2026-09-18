import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Plus,
  X,
  AlertCircle,
  HelpCircle,
  Download,
  Filter,
  BarChart3,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  MARKET_PRICE_SERIES,
  HISTORICAL_MANDI_RECORDS,
  COMMODITY_CONFIGS,
  KARNATAKA_DISTRICTS
} from '../../data/farmerTradesData';
import './MarketPricesPage.css';

const DATE_RANGES = [
  { id: '1W', label: '1 Week', points: 3 },
  { id: '1M', label: '1 Month', points: 6 },
  { id: '3M', label: '3 Months', points: 9 },
  { id: '1Y', label: '1 Year', points: 12 }
];

const MANDI_LOCATIONS = [
  'All Mandis (State Aggregate)',
  'Mandya APMC Yard',
  'Bengaluru APMC (Yeshwanthpur)',
  'Hubli APMC Yard',
  'Mysuru Bandipalya APMC',
  'Guntur Mirchi Yard'
];

export const MarketPricesPage: React.FC = () => {
  // Selected commodities to show on chart
  const [activeCommodityKeys, setActiveCommodityKeys] = useState<string[]>([
    'ragi',
    'wheat',
    'paddy'
  ]);
  const [selectedMandi, setSelectedMandi] = useState(MANDI_LOCATIONS[0]);
  const [selectedRange, setSelectedRange] = useState('1M');
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [tableSearch, setTableSearch] = useState('');

  // Date sliced data for chart
  const chartData = useMemo(() => {
    const rangeConfig = DATE_RANGES.find((r) => r.id === selectedRange) || DATE_RANGES[1];
    return MARKET_PRICE_SERIES.slice(-rangeConfig.points);
  }, [selectedRange]);

  // Toggle commodity line
  const handleToggleCommodity = (key: string) => {
    if (activeCommodityKeys.includes(key)) {
      if (activeCommodityKeys.length === 1) return; // Keep at least one
      setActiveCommodityKeys(activeCommodityKeys.filter((k) => k !== key));
    } else {
      setActiveCommodityKeys([...activeCommodityKeys, key]);
    }
  };

  const handleAddCommodity = (key: string) => {
    if (!activeCommodityKeys.includes(key)) {
      setActiveCommodityKeys([...activeCommodityKeys, key]);
    }
    setShowAddDropdown(false);
  };

  // Filtered table rows
  const filteredTableRecords = useMemo(() => {
    return HISTORICAL_MANDI_RECORDS.filter((rec) => {
      if (!tableSearch.trim()) return true;
      const q = tableSearch.toLowerCase();
      return (
        rec.commodity.toLowerCase().includes(q) ||
        rec.mandi.toLowerCase().includes(q) ||
        rec.date.toLowerCase().includes(q)
      );
    });
  }, [tableSearch]);

  return (
    <div className="ft-prices-page">
      {/* Banner */}
      <div className="ft-prices-banner">
        <div className="ft-prices-banner-inner">
          <div className="ft-prices-badge">
            <BarChart3 size={14} /> APMC MANDI PRICE BENCHMARKS (SAMPLE DATA)
          </div>
          <h1>Agricultural Market Price Intelligence</h1>
          <p>
            Track modal prices, historical trends, and price spreads across major APMC grain and commodity yards in Karnataka and southern India.
          </p>
          <div className="ft-sample-disclaimer">
            <Info size={14} className="flex-shrink-0" />
            <span>
              <strong>Note:</strong> All rates shown are curated sample simulation data in ₹/quintal for architectural demonstration. They do not represent live government mandi rates.
            </span>
          </div>
        </div>
      </div>

      <div className="ft-prices-container">
        {/* Top Control Bar: Mandi Selector, Date Range, Add Commodity */}
        <div className="ft-chart-controls-card">
          <div className="ft-controls-left">
            <div className="ft-mandi-select-wrap">
              <MapPin size={16} className="text-emerald-700" />
              <select
                value={selectedMandi}
                onChange={(e) => setSelectedMandi(e.target.value)}
                className="ft-mandi-select"
              >
                {MANDI_LOCATIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="ft-date-range-pills">
              {DATE_RANGES.map((r) => (
                <button
                  key={r.id}
                  className={`ft-range-pill ${selectedRange === r.id ? 'active' : ''}`}
                  onClick={() => setSelectedRange(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ft-controls-right">
            <div className="ft-add-commodity-wrap">
              <button
                className="ft-btn-add-commodity"
                onClick={() => setShowAddDropdown(!showAddDropdown)}
              >
                <Plus size={16} /> Add Commodity to Chart
              </button>

              {showAddDropdown && (
                <div className="ft-add-commodity-dropdown">
                  <div className="ft-dropdown-header">Available Commodities:</div>
                  {COMMODITY_CONFIGS.map((cfg) => {
                    const isAdded = activeCommodityKeys.includes(cfg.key);
                    return (
                      <button
                        key={cfg.key}
                        className={`ft-dropdown-item ${isAdded ? 'already-added' : ''}`}
                        onClick={() => handleAddCommodity(cfg.key)}
                        disabled={isAdded}
                      >
                        <span className="ft-dot-color" style={{ backgroundColor: cfg.color }}></span>
                        <span>{cfg.label}</span>
                        {isAdded && <span className="ft-added-check">✓ Added</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Commodity Chips Bar */}
        <div className="ft-commodity-chips-bar">
          <span className="ft-chips-label">Chart Lines:</span>
          {COMMODITY_CONFIGS.map((cfg) => {
            const isActive = activeCommodityKeys.includes(cfg.key);
            return (
              <button
                key={cfg.key}
                className={`ft-commodity-chip ${isActive ? 'active' : 'inactive'}`}
                onClick={() => handleToggleCommodity(cfg.key)}
                style={{
                  borderColor: isActive ? cfg.color : '#e2e8f0',
                  color: isActive ? '#0f172a' : '#64748b'
                }}
              >
                <span
                  className="ft-chip-indicator"
                  style={{ backgroundColor: isActive ? cfg.color : '#cbd5e1' }}
                ></span>
                <span>{cfg.label}</span>
                {isActive && activeCommodityKeys.length > 1 && (
                  <X size={12} className="ft-chip-remove" />
                )}
              </button>
            );
          })}
        </div>

        {/* Multi-Crop Line Chart Container */}
        <div className="ft-chart-card">
          <div className="ft-chart-card-header">
            <div>
              <h3>Price Trends ({selectedMandi})</h3>
              <p className="ft-chart-subtitle">Daily modal prices in ₹ per quintal (100 kg)</p>
            </div>
            <div className="ft-chart-legend-custom">
              {COMMODITY_CONFIGS.filter((c) => activeCommodityKeys.includes(c.key)).map((c) => (
                <div key={c.key} className="ft-legend-item">
                  <span className="ft-legend-color" style={{ backgroundColor: c.color }}></span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ft-chart-canvas-wrap">
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                  domain={['auto', 'auto']}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')} / qtl`]}
                />
                {COMMODITY_CONFIGS.filter((c) => activeCommodityKeys.includes(c.key)).map((cfg) => (
                  <Line
                    key={cfg.key}
                    type="monotone"
                    dataKey={cfg.key}
                    name={cfg.label}
                    stroke={cfg.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commodity Comparison Cards */}
        <div className="ft-comparison-cards-grid">
          {COMMODITY_CONFIGS.filter((c) => activeCommodityKeys.includes(c.key)).map((cfg) => {
            const latestPoint = chartData[chartData.length - 1];
            const prevPoint = chartData[chartData.length - 2] || latestPoint;
            const currentPrice = (latestPoint as any)?.[cfg.key] || 0;
            const prevPrice = (prevPoint as any)?.[cfg.key] || currentPrice;
            const changeDiff = currentPrice - prevPrice;
            const changePercent = prevPrice > 0 ? ((changeDiff / prevPrice) * 100).toFixed(1) : '0.0';
            const isPositive = changeDiff >= 0;

            return (
              <div key={cfg.key} className="ft-price-comp-card">
                <div className="ft-comp-card-top">
                  <div className="ft-comp-name-wrap">
                    <span className="ft-comp-dot" style={{ backgroundColor: cfg.color }}></span>
                    <h4 className="ft-comp-crop-name">{cfg.label}</h4>
                  </div>
                  <div className={`ft-comp-change-pill ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>{isPositive ? `+${changePercent}%` : `${changePercent}%`}</span>
                  </div>
                </div>

                <div className="ft-comp-current-price">
                  ₹{currentPrice.toLocaleString('en-IN')}
                  <span className="ft-comp-unit">/ qtl</span>
                </div>

                <div className="ft-comp-details-list">
                  <div className="ft-comp-detail-row">
                    <span>Govt MSP Benchmark:</span>
                    <strong>₹{cfg.msp.toLocaleString('en-IN')}/qtl</strong>
                  </div>
                  <div className="ft-comp-detail-row">
                    <span>Spread over MSP:</span>
                    <strong className={currentPrice >= cfg.msp ? 'text-emerald-700' : 'text-amber-700'}>
                      {currentPrice >= cfg.msp ? `+₹${currentPrice - cfg.msp}/qtl` : `-₹${cfg.msp - currentPrice}/qtl`}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Historical Price Table */}
        <div className="ft-historical-table-card">
          <div className="ft-table-header">
            <div>
              <h3>Historical APMC Yard Transactions</h3>
              <p className="ft-table-subtitle">Sample arrivals & grade-wise modal quotes</p>
            </div>
            <div className="ft-table-search">
              <input
                type="text"
                placeholder="Filter by crop, mandi, date..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="ft-table-overflow">
            <table className="ft-mandi-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Commodity</th>
                  <th>APMC Mandi</th>
                  <th>Min Price</th>
                  <th>Modal Price (₹/qtl)</th>
                  <th>Max Price</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {filteredTableRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td>{rec.date}</td>
                    <td><strong>{rec.commodity}</strong></td>
                    <td>{rec.mandi}</td>
                    <td>₹{rec.minPrice.toLocaleString('en-IN')}</td>
                    <td className="ft-td-modal font-bold text-emerald-800">
                      ₹{rec.modalPrice.toLocaleString('en-IN')}
                    </td>
                    <td>₹{rec.maxPrice.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`ft-trend-tag ${rec.trend}`}>
                        {rec.trend === 'up' ? '▲ Bullish' : '▼ Bearish'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
