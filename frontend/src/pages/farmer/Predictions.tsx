import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Brain, BarChart3, TrendingUp, FlaskConical, Sparkles, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type PredictionType = 'crop' | 'yield' | 'recommend-fertilizer';

interface PredictionPageProps {
  type: PredictionType;
}

export const YIELD_CROPS = [
  { id: '1', name: 'Ragi (Finger Millet)' },
  { id: '2', name: 'Paddy (Rice)' },
  { id: '3', name: 'Jowar (Sorghum)' },
  { id: '4', name: 'Maize' },
  { id: '5', name: 'Sugarcane' },
];

export const YIELD_SEASONS = [
  { id: '1', name: 'Kharif (Monsoon Season)' },
  { id: '2', name: 'Rabi (Winter Season)' },
];

interface YieldResultDetails {
  cropName: string;
  seasonName: string;
  area: number;
  areaUnit: string;
  yieldPerAcre: number;
  yieldUnit: string;
  totalYield: number;
  totalUnit: string;
  rainfallMm: number;
}

interface CropMlResult {
  predictedCrop: string;
  modelVersion: string;
  educationalDemo: boolean;
  limitations: string[];
}

interface FeatureRange {
  min: number;
  max: number;
}

const EXAMPLE_CROP_INPUTS = ['90', '42', '43', '20.8', '82', '6.5', '202.9'];

const FIELD_TO_FEATURE_KEY: Record<string, string> = {
  'Nitrogen (N)': 'N',
  'Phosphorus (P)': 'P',
  'Potassium (K)': 'K',
  'Temperature (°C)': 'temperature',
  'Humidity (%)': 'humidity',
  'pH Level': 'ph',
  'Rainfall (mm)': 'rainfall',
};

const config: Record<PredictionType, {
  title: string;
  desc: string;
  icon: React.ReactNode;
  endpoint: string;
  resultKey: string;
  fields: string[];
}> = {
  crop: {
    title: 'Crop Prediction — ML Prototype',
    desc: 'Trained Random Forest classifier for educational crop suitability demonstration. Not field-validated farming advice.',
    icon: <Brain size={24} />,
    endpoint: '/ml/crop-demo',
    resultKey: 'predicted_crop',
    fields: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)', 'Temperature (°C)', 'Humidity (%)', 'pH Level', 'Rainfall (mm)']
  },
  yield: {
    title: 'Experimental rule-based yield estimate',
    desc: 'Calculates an experimental yield estimate using a predefined formula based on land area and rainfall.',
    icon: <BarChart3 size={24} />,
    endpoint: '/predict/yield',
    resultKey: 'prediction',
    fields: ['Cultivation Area (Acres)', 'Season', 'Crop', 'Rainfall (mm)']
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
  // Do not automatically fill crop prediction from soil tests or weather data
  if (type === 'crop') {
    return { values: fields.map(() => ''), isPrefilled: false };
  }
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

function getFieldInputAttributes(type: PredictionType, fieldName: string) {
  if (type === 'crop') {
    if (fieldName.startsWith('pH')) {
      return { min: 0, max: 14, step: '0.1' };
    }
    if (fieldName.startsWith('Humidity')) {
      return { min: 0, max: 100, step: 'any' };
    }
    if (fieldName.startsWith('Nitrogen') || fieldName.startsWith('Phosphorus') || fieldName.startsWith('Potassium') || fieldName.startsWith('Rainfall')) {
      return { min: 0, step: 'any' };
    }
    if (fieldName.startsWith('Temperature')) {
      return { step: 'any' };
    }
  }
  return {};
}

function formatRangeText(
  fieldName: string,
  ranges: Record<string, FeatureRange> | null,
  metaError: boolean
): string {
  const key = FIELD_TO_FEATURE_KEY[fieldName];
  let rangePrefix = '';
  if (metaError) {
    rangePrefix = 'Training ranges unavailable.';
  } else if (!ranges || !ranges[key]) {
    rangePrefix = 'Loading training range…';
  } else {
    const { min, max } = ranges[key];
    const minStr = Number.isInteger(min) ? min.toString() : min.toFixed(1);
    const maxStr = Number.isInteger(max) ? max.toString() : max.toFixed(1);
    rangePrefix = `Training-data range: ${minStr}–${maxStr}.`;
  }

  // Unit and time-period notes
  if (fieldName.startsWith('Nitrogen') || fieldName.startsWith('Phosphorus') || fieldName.startsWith('Potassium')) {
    return `${rangePrefix} Unit not documented.`;
  }
  if (fieldName.startsWith('Temperature')) {
    return `${rangePrefix} °C (Supports negative temperatures).`;
  }
  if (fieldName.startsWith('Humidity')) {
    return `${rangePrefix} %.`;
  }
  if (fieldName.startsWith('pH')) {
    return `${rangePrefix}`;
  }
  if (fieldName.startsWith('Rainfall')) {
    return `${rangePrefix} mm. (Time period not documented: unknown if annual, seasonal, or monthly).`;
  }
  return rangePrefix;
}

export default function Predictions({ type }: PredictionPageProps) {
  const cfg = config[type] || config.crop;
  const location = useLocation();
  const [prevType, setPrevType] = useState(type);
  const [prevState, setPrevState] = useState(location.state);
  const initial = getInitialValues(type, location.state, cfg.fields);
  const [values, setValues] = useState<string[]>(initial.values);
  const [result, setResult] = useState('');
  const [cropMlResult, setCropMlResult] = useState<CropMlResult | null>(null);
  const [submissionOutOfRange, setSubmissionOutOfRange] = useState(false);
  const [yieldDetails, setYieldDetails] = useState<YieldResultDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(initial.isPrefilled);

  // Model training range guidance state
  const [trainingRanges, setTrainingRanges] = useState<Record<string, FeatureRange> | null>(null);
  const [metadataLoadingError, setMetadataLoadingError] = useState<boolean>(false);

  useEffect(() => {
    if (type === 'crop') {
      api.get('/ml/crop-metadata')
        .then((res) => {
          if (res.data && res.data.training_data_ranges) {
            setTrainingRanges(res.data.training_data_ranges);
            setMetadataLoadingError(false);
          } else {
            setMetadataLoadingError(true);
          }
        })
        .catch(() => {
          setMetadataLoadingError(true);
        });
    }
  }, [type]);

  if (prevType !== type || prevState !== location.state) {
    setPrevType(type);
    setPrevState(location.state);
    const next = getInitialValues(type, location.state, cfg.fields);
    setValues(next.values);
    setIsPrefilled(next.isPrefilled);
    setResult('');
    setCropMlResult(null);
    setSubmissionOutOfRange(false);
    setYieldDetails(null);
    setErrorMessage(null);
  }

  function handleValueChange(index: number, val: string) {
    const next = [...values];
    next[index] = val;
    setValues(next);
    // Clear outdated results and errors whenever any input changes
    setResult('');
    setCropMlResult(null);
    setSubmissionOutOfRange(false);
    setYieldDetails(null);
    setErrorMessage(null);
  }

  function handleLoadExampleInputs() {
    setValues([...EXAMPLE_CROP_INPUTS]);
    setResult('');
    setCropMlResult(null);
    setSubmissionOutOfRange(false);
    setYieldDetails(null);
    setErrorMessage(null);
  }

  function isFieldOutOfRange(fieldName: string, valStr: string): boolean {
    if (!trainingRanges) return false;
    const key = FIELD_TO_FEATURE_KEY[fieldName];
    if (!key || !trainingRanges[key]) return false;
    const num = parseFloat(valStr);
    if (isNaN(num) || !isFinite(num)) return false;
    const { min, max } = trainingRanges[key];
    return num < min || num > max;
  }

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault();
    setResult('');
    setCropMlResult(null);
    setSubmissionOutOfRange(false);
    setYieldDetails(null);
    setErrorMessage(null);
    setLoading(true);

    try {
      const numValues = values.map(Number);

      if (type === 'crop') {
        if (numValues.length !== 7 || numValues.some((v) => isNaN(v) || !isFinite(v))) {
          setErrorMessage('Please fill in all 7 numeric parameters with valid finite values.');
          setLoading(false);
          return;
        }
        const [n, p, k, temp, humidity, ph, rainfall] = numValues;
        if (n < 0 || p < 0 || k < 0) {
          setErrorMessage('Soil nutrient values (N, P, K) cannot be negative.');
          setLoading(false);
          return;
        }
        if (ph < 0 || ph > 14) {
          setErrorMessage('Soil pH must be between 0.0 and 14.0.');
          setLoading(false);
          return;
        }
        if (humidity < 0 || humidity > 100) {
          setErrorMessage('Relative humidity must be between 0% and 100%.');
          setLoading(false);
          return;
        }
        if (rainfall < 0) {
          setErrorMessage('Rainfall cannot be negative.');
          setLoading(false);
          return;
        }
        // Note: Temperature is permitted to be negative

        // Check if any input is outside training range (do not clamp values)
        const isAnyOutside = numValues.some((val, idx) => {
          const fName = cfg.fields[idx];
          const key = FIELD_TO_FEATURE_KEY[fName];
          if (!trainingRanges || !trainingRanges[key]) return false;
          return val < trainingRanges[key].min || val > trainingRanges[key].max;
        });
        setSubmissionOutOfRange(isAnyOutside);

        const cropPayload = {
          N: n,
          P: p,
          K: k,
          temperature: temp,
          humidity: humidity,
          ph: ph,
          rainfall: rainfall,
        };

        const res = await api.post(cfg.endpoint, cropPayload);
        if (res.data && res.data.predicted_crop) {
          setCropMlResult({
            predictedCrop: res.data.predicted_crop,
            modelVersion: res.data.model_version || 'crop_classifier_v1.0',
            educationalDemo: Boolean(res.data.educational_demo),
            limitations: Array.isArray(res.data.limitations) ? res.data.limitations : [],
          });
        } else {
          setErrorMessage('Unable to generate crop prediction from the ML service. Please try again.');
        }
        return;
      }

      if (type === 'yield') {
        const [area, season, crop, rainfall] = numValues;
        if (isNaN(area) || area <= 0) {
          setErrorMessage('Cultivation area must be a positive number greater than 0 acres.');
          setLoading(false);
          return;
        }
        if (isNaN(season) || ![1, 2].includes(season)) {
          setErrorMessage('Please select a valid season (Kharif or Rabi).');
          setLoading(false);
          return;
        }
        if (isNaN(crop) || crop < 1 || crop > 5) {
          setErrorMessage('Please select a valid crop from the registered crops dropdown.');
          setLoading(false);
          return;
        }
        if (isNaN(rainfall) || rainfall < 0) {
          setErrorMessage('Rainfall must be a non-negative number (0 mm or higher).');
          setLoading(false);
          return;
        }
      }

      // Default handler for yield and recommend-fertilizer
      const res = await api.post(cfg.endpoint, { features: numValues });
      if (res.data && res.data[cfg.resultKey]) {
        setResult(res.data[cfg.resultKey]);
        if (type === 'yield' && res.data.yield_per_acre !== undefined) {
          const cropObj = YIELD_CROPS.find((c) => c.id === String(Math.round(numValues[2])));
          const seasonObj = YIELD_SEASONS.find((s) => s.id === String(Math.round(numValues[1])));
          setYieldDetails({
            cropName: res.data.crop_name || cropObj?.name || 'Selected Crop',
            seasonName: res.data.season_name || seasonObj?.name || 'Selected Season',
            area: res.data.area,
            areaUnit: res.data.area_unit || 'acres',
            yieldPerAcre: res.data.yield_per_acre,
            yieldUnit: res.data.yield_unit || 'Quintals/Acre',
            totalYield: res.data.total_yield,
            totalUnit: res.data.total_unit || 'Quintals',
            rainfallMm: res.data.rainfall_mm,
          });
        }
      } else {
        setResult('');
        setYieldDetails(null);
        setErrorMessage(
          type === 'yield'
            ? 'Unable to generate a yield estimate. Please check your inputs and try again.'
            : 'Unable to generate a recommendation. Please try again.'
        );
      }
    } catch (err: any) {
      setResult('');
      setCropMlResult(null);
      setSubmissionOutOfRange(false);
      setYieldDetails(null);
      const detail = err.response?.data?.detail;
      setErrorMessage(
        detail ||
        (type === 'crop'
          ? 'Unable to generate crop prediction from the ML service. Please try again.'
          : type === 'yield'
          ? 'Unable to generate a yield estimate. Please check your inputs and try again.'
          : 'Unable to generate a prediction. Please try again.')
      );
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
          {type !== 'crop' && (
            <Link
              to="/farmer/soil-test"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FlaskConical size={15} /> Run Soil Test
            </Link>
          )}
        </div>
      </div>

      {/* Yield Explanation Section */}
      {type === 'yield' && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: '#334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#0f172a' }}>
            <Info size={18} style={{ color: 'var(--primary)' }} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>How yield estimation works</h4>
          </div>
          <p style={{ margin: '0 0 0.5rem', lineHeight: 1.5 }}>
            Yield estimation predicts how much of a selected crop may be harvested. A trained model learns from historical crop and harvest records. Results depend on the available data and growing conditions, and actual harvest may differ.
          </p>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.82rem', color: '#64748b' }}>
            <strong>Current status:</strong>{' '}
            <span className="badge badge-amber" style={{ fontSize: '0.72rem', verticalAlign: 'middle' }}>
              Experimental rule-based yield estimate
            </span>
            <p style={{ margin: '0.25rem 0 0', lineHeight: 1.4 }}>
              This prototype computes an estimate via a basic mathematical rainfall formula. It has not been calibrated against localized historical field data.
            </p>
          </div>
        </div>
      )}

      {/* Crop ML Prototype Explanation Section */}
      {type === 'crop' && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            color: '#334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#0f172a' }}>
            <Info size={18} style={{ color: 'var(--primary)' }} />
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Educational ML Prototype</h4>
          </div>
          <p style={{ margin: '0 0 0.5rem', lineHeight: 1.5 }}>
            This feature uses a trained <strong>Random Forest classifier</strong> for educational demonstration of crop classification. It is trained on an open benchmark dataset and is <strong>not field-validated farming advice</strong>.
          </p>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
            <strong>Documented Limitations:</strong> Soil nutrient units (N, P, K) and rainfall observation periods are undocumented in the source dataset. The model does not include regional Karnataka dryland staples (such as Ragi and Jowar) and has not undergone field trials on local farms.
          </div>
        </div>
      )}

      {/* Load Example Inputs and Training Range Guidance Explanation */}
      {type === 'crop' && (
        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1.15rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>Demonstration Inputs</span>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                These are demonstration inputs, not recommended farming conditions.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLoadExampleInputs}
              disabled={loading}
            >
              Load example inputs
            </button>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>Range Guidance: </span>
            These ranges describe the examples used for training. They are not recommended farming conditions or a guarantee of reliable predictions.
          </div>
        </div>
      )}

      {/* Soil Test Prefill Banner (only for non-crop pages) */}
      {isPrefilled && type !== 'crop' && (
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
          {type === 'yield' ? (
            <>
              {/* Field 0: Cultivation Area */}
              <div className="form-group">
                <label className="form-label">Cultivation Area (Acres)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="e.g. 2.5"
                  min="0.01"
                  step="any"
                  value={values[0] || ''}
                  onChange={(e) => handleValueChange(0, e.target.value)}
                  required
                  disabled={loading}
                />
                <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                  Total land area under cultivation in acres (must be greater than 0).
                </small>
              </div>

              {/* Field 1: Season */}
              <div className="form-group">
                <label className="form-label">Season</label>
                <select
                  className="input"
                  value={values[1] || ''}
                  onChange={(e) => handleValueChange(1, e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="" disabled>Select cropping season...</option>
                  {YIELD_SEASONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                  Supported growing seasons: Kharif (monsoon) or Rabi (winter).
                </small>
              </div>

              {/* Field 2: Target Crop */}
              <div className="form-group">
                <label className="form-label">Target Crop</label>
                <select
                  className="input"
                  value={values[2] || ''}
                  onChange={(e) => handleValueChange(2, e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="" disabled>Select crop...</option>
                  {YIELD_CROPS.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                  Select from registered produce crops supported by the platform.
                </small>
              </div>

              {/* Field 3: Rainfall */}
              <div className="form-group">
                <label className="form-label">Rainfall (mm)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="e.g. 820"
                  min="0"
                  step="any"
                  value={values[3] || ''}
                  onChange={(e) => handleValueChange(3, e.target.value)}
                  required
                  disabled={loading}
                />
                <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                  Expected rainfall in millimeters. <em>(Limitation: The underlying formula does not document whether this represents annual or seasonal crop-cycle rainfall).</em>
                </small>
              </div>
            </>
          ) : (
            cfg.fields.map((f, i) => {
              const extraProps = getFieldInputAttributes(type, f);
              const helperText = type === 'crop' ? formatRangeText(f, trainingRanges, metadataLoadingError) : null;
              const outOfRange = type === 'crop' && isFieldOutOfRange(f, values[i] || '');

              return (
                <div className="form-group" key={f}>
                  <label className="form-label">{f}</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="Enter value..."
                    value={values[i] || ''}
                    onChange={(e) => handleValueChange(i, e.target.value)}
                    required
                    disabled={loading}
                    style={outOfRange ? { borderColor: '#f59e0b', backgroundColor: '#fffdfa' } : undefined}
                    {...extraProps}
                  />
                  {helperText && (
                    <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>
                      {helperText}
                    </small>
                  )}
                  {outOfRange && (
                    <small style={{ color: '#b45309', fontSize: '0.76rem', marginTop: '0.15rem', display: 'block', fontWeight: 500 }}>
                      ⚠️ Outside the training-data range; this prediction may be unreliable.
                    </small>
                  )}
                </div>
              );
            })
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading
              ? 'Predicting with ML Model…'
              : type === 'crop'
              ? 'Predict Crop with ML'
              : type === 'yield'
              ? 'Calculate Yield Estimate'
              : `Compute ${cfg.title}`}
          </button>
        </form>

        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'var(--primary-subtle)', padding: '1rem', borderRadius: '50%' }}>
              {cfg.icon}
            </div>
          </div>

          {errorMessage ? (
            <div
              className="animate-fadeIn"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '1.25rem',
                color: '#991b1b',
                textAlign: 'center',
              }}
            >
              <AlertCircle size={32} style={{ color: '#dc2626', margin: '0 auto 0.75rem', display: 'block' }} />
              <h4 style={{ margin: '0 0 0.5rem', color: '#991b1b' }}>Prediction Error</h4>
              <p style={{ margin: '0 0 1rem', fontSize: '0.92rem', fontWeight: 500 }}>{errorMessage}</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setErrorMessage(null)}
              >
                Dismiss & Retry
              </button>
            </div>
          ) : type === 'crop' && cropMlResult ? (
            <div className="animate-fadeIn" style={{ textAlign: 'left' }}>
              {/* Out of range alert banner in result card */}
              {submissionOutOfRange && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fcd34d',
                    borderRadius: 8,
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    color: '#92400e',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
                  <span>Outside the training-data range; this prediction may be unreliable.</span>
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <span className="badge badge-green" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  ML Prototype Prediction
                </span>
                <h3 style={{ margin: '0.25rem 0 0', color: 'var(--primary)', fontSize: '1.15rem' }}>
                  Model-predicted crop
                </h3>
                <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.5rem 0', textTransform: 'capitalize' }}>
                  {cropMlResult.predictedCrop}
                </p>
                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: 4, fontFamily: 'monospace' }}>
                  Model: {cropMlResult.modelVersion}
                </span>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '1rem 1.25rem',
                  marginBottom: '1rem',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: '#0f172a' }}>Model Limitations:</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  {cropMlResult.limitations.map((lim, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{lim}</li>
                  ))}
                </ul>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
                “This output is an educational ML benchmark prediction, not agricultural advice.”
              </p>
            </div>
          ) : type === 'yield' && yieldDetails ? (
            <div className="animate-fadeIn" style={{ textAlign: 'left' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <span className="badge badge-amber" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  Experimental Rule-Based Estimate
                </span>
                <h3 style={{ margin: '0.25rem 0 0', color: 'var(--primary)', fontSize: '1.35rem' }}>Estimated Yield & Harvest</h3>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '1rem 1.25rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #edf2f7', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b' }}>Selected Crop:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{yieldDetails.cropName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #edf2f7', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b' }}>Season:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{yieldDetails.seasonName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #edf2f7', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b' }}>Cultivation Area:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{yieldDetails.area} {yieldDetails.areaUnit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #edf2f7', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b' }}>Estimated Yield per Unit Area:</span>
                  <span style={{ fontWeight: 700, color: '#15803d' }}>{yieldDetails.yieldPerAcre} {yieldDetails.yieldUnit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0.2rem', fontSize: '0.95rem' }}>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>Estimated Total Harvest:</span>
                  <span style={{ fontWeight: 800, color: '#15803d', fontSize: '1.2rem' }}>
                    {yieldDetails.totalYield} {yieldDetails.totalUnit}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', margin: '0 0 0.5rem', textAlign: 'center' }}>
                “This is an estimate, not a guaranteed harvest.”
              </p>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
                Calculated directly as yield ({yieldDetails.yieldPerAcre} Quintals/Acre) × area ({yieldDetails.area} Acres).
              </p>
            </div>
          ) : result ? (
            <div className="animate-fadeIn">
              <span className="badge badge-green" style={{ marginBottom: '0.75rem' }}>
                Prediction Output
              </span>
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
                Predicted Output
              </h3>
              <p style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                {result}
              </p>
            </div>
          ) : (
            <div>
              <h3 style={{ margin: '0 0 0.5rem' }}>Ready</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {type === 'crop'
                  ? 'Enter your soil and climate parameters or click "Load example inputs" to generate an ML prediction.'
                  : type === 'yield'
                  ? 'Enter your plot area, season, target crop, and rainfall to calculate an estimated harvest.'
                  : 'Fill in your farm conditions and click compute to get an estimate.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
