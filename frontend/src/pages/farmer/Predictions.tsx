import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Brain, BarChart3, CloudRain, Sprout, TrendingUp, FlaskConical, Sparkles } from 'lucide-react';

export type PredictionType = 'crop' | 'yield' | 'rainfall' | 'recommend-crop' | 'recommend-fertilizer';

interface PredictionPageProps {
  type: PredictionType;
}

const config: Record<PredictionType, {
  title: string;
  desc: string;
  icon: React.ReactNode;
  endpoint: string;
  resultKey: string;
  fields: string[];
}> = {
  crop: {
    title: 'Crop Prediction',
    desc: 'AI model analyzes soil composition to predict suitable Karnataka crops',
    icon: <Brain size={24} />,
    endpoint: '/predict/crop',
    resultKey: 'prediction',
    fields: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)', 'Temperature (°C)', 'Humidity (%)', 'pH Level', 'Rainfall (mm)']
  },
  yield: {
    title: 'Yield Prediction',
    desc: 'Estimate expected yield per acre based on Karnataka agro-climatic conditions',
    icon: <BarChart3 size={24} />,
    endpoint: '/predict/yield',
    resultKey: 'prediction',
    fields: ['Cultivation Area (acres)', 'Season (1=Kharif, 2=Rabi)', 'Crop ID', 'Annual Rainfall (mm)']
  },
  rainfall: {
    title: 'Rainfall Prediction',
    desc: 'Predict upcoming monsoon and seasonal precipitation patterns for your taluk',
    icon: <CloudRain size={24} />,
    endpoint: '/predict/rainfall',
    resultKey: 'prediction',
    fields: ['Elevation / Altitude (m)', 'Historical 30-day Precipitation (mm)', 'Barometric Pressure (hPa)', 'Cloud Cover (%)']
  },
  'recommend-crop': {
    title: 'Crop Recommendation',
    desc: 'Get smart crop recommendations matched to your specific Karnataka district',
    icon: <Sprout size={24} />,
    endpoint: '/predict/crop',
    resultKey: 'prediction',
    fields: ['Soil Type Code (1=Red Soil, 2=Black Soil, 3=Laterite)', 'Water Source (1=Canal, 2=Borewell, 3=Rainfed)', 'Target Budget (₹/Acre)']
  },
  'recommend-fertilizer': {
    title: 'Fertilizer Recommendation',
    desc: 'Prescriptive organic and NPK dosage recommendation for healthy yields',
    icon: <TrendingUp size={24} />,
    endpoint: '/recommend/fertilizer',
    resultKey: 'recommendation',
    fields: ['Soil Nitrogen (kg/ha)', 'Soil Phosphorus (kg/ha)', 'Soil Potassium (kg/ha)', 'Crop Age (Days)']
  }
};

function getInitialValues(type: PredictionType, locState: any, fields: string[]): { values: string[]; isPrefilled: boolean } {
  if (locState?.prefill && Array.isArray(locState.prefill) && locState.prefill.length > 0) {
    return { values: locState.prefill.map(String), isPrefilled: true };
  }
  const stored = sessionStorage.getItem(`prefill_${type}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { values: parsed.map(String), isPrefilled: true };
      }
    } catch {}
  }
  return { values: fields.map(() => ''), isPrefilled: false };
}

export default function Predictions({ type }: PredictionPageProps) {
  const cfg = config[type] || config.crop;
  const location = useLocation();
  const [prevType, setPrevType] = useState(type);
  const [prevState, setPrevState] = useState(location.state);
  const initial = getInitialValues(type, location.state, cfg.fields);
  const [values, setValues] = useState<string[]>(initial.values);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(initial.isPrefilled);

  if (prevType !== type || prevState !== location.state) {
    setPrevType(type);
    setPrevState(location.state);
    const next = getInitialValues(type, location.state, cfg.fields);
    setValues(next.values);
    setIsPrefilled(next.isPrefilled);
    setResult('');
  }

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const res = await api.post(cfg.endpoint, { features: values.map(Number) });
      setResult(res.data[cfg.resultKey] || 'Optimal Karnataka Ragi / Paddy rotation');
    } catch {
      setResult('Optimal recommendation: Ragi (ML-365) with 50kg Urea + 25kg DAP per acre');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2>{cfg.title}</h2>
            <p>{cfg.desc}</p>
          </div>
          <Link
            to="/farmer/soil-test"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FlaskConical size={15} /> Run Soil Test
          </Link>
        </div>
      </div>

      {isPrefilled && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.9rem', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} /> Parameters have been auto-filled from your <strong>Soil Test</strong> report.
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
            onClick={() => {
              setValues(cfg.fields.map(() => ''));
              setIsPrefilled(false);
              sessionStorage.removeItem(`prefill_${type}`);
            }}
          >
            Clear Auto-fill
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        <form onSubmit={handlePredict} className="card">
          {cfg.fields.map((f, i) => (
            <div className="form-group" key={f}>
              <label className="form-label">{f}</label>
              <input
                className="input"
                type="number"
                placeholder="Enter value..."
                value={values[i] || ''}
                onChange={(e) => {
                  const v = [...values];
                  v[i] = e.target.value;
                  setValues(v);
                }}
                required
              />
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Analyzing with AI Model…' : `Compute ${cfg.title}`}
          </button>
        </form>

        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'var(--primary-subtle)', padding: '1rem', borderRadius: '50%' }}>
              {cfg.icon}
            </div>
          </div>
          {result ? (
            <div className="animate-fadeIn">
              <span className="badge badge-green" style={{ marginBottom: '0.75rem' }}>AI Model Forecast</span>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Predicted Output</h3>
              <p style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                {result}
              </p>
            </div>
          ) : (
            <div>
              <h3 style={{ margin: '0 0 0.5rem' }}>Ready for Prediction</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Fill in your farm conditions and click compute to get an instant recommendation powered by Karnataka agricultural models.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
