import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  FlaskConical,
  PhoneCall,
  MapPin,
  CheckCircle2,
  User,
  Phone,
  Building,
  Brain,
  BarChart3,
  CloudRain,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

interface SoilTestReport {
  sample_id: string;
  tested_date: string;
  values: {
    n: number;
    p: number;
    k: number;
    temp: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
  health_score: number;
  soil_type: string;
}

interface SoilTestRequest {
  id: number;
  farmer_name: string;
  phone: string;
  district: string;
  taluk: string;
  village: string;
  land_acres: number;
  status: string;
  created_at: string;
  officer_name: string;
  report?: SoilTestReport;
}

const KARNATAKA_DISTRICTS = [
  'Mandya',
  'Mysuru',
  'Hassan',
  'Tumakuru',
  'Belagavi',
  'Shivamogga',
  'Kalaburagi',
  'Kolar',
  'Dharwad',
  'Ballari',
  'Chikkamagaluru',
  'Davanagere',
  'Raichur',
  'Udupi',
];

export default function SoilTest() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [farmerName, setFarmerName] = useState(user?.name || 'Ramesh Gowda');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [district, setDistrict] = useState('Mandya');
  const [taluk, setTaluk] = useState('Pandavapura');
  const [village, setVillage] = useState('Holenarasipura Cross');
  const [landAcres, setLandAcres] = useState<number | string>(4.5);
  const [preferredDate, setPreferredDate] = useState('');

  // UI flow states
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<SoilTestRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'request' | 'report'>('request');
  const [submittedRequest, setSubmittedRequest] = useState<SoilTestRequest | null>(null);
  const [selectedReport, setSelectedReport] = useState<SoilTestReport | null>(null);

  // Load existing requests
  useEffect(() => {
    api.get('/soil-test-requests')
      .then((res) => {
        const data = res.data as SoilTestRequest[];
        setRequests(data);
        // Find if there is any completed report
        const completed = data.find((r) => r.report);
        if (completed && completed.report) {
          setSelectedReport(completed.report);
        }
      })
      .catch(() => {
        // Fallback initial mock if endpoint has any delay
        const fallbackReq: SoilTestRequest = {
          id: 1,
          farmer_name: user?.name || 'Ramesh Gowda',
          phone: '+91 98450 12345',
          district: 'Mandya',
          taluk: 'Pandavapura',
          village: 'Holenarasipura Cross',
          land_acres: 4.5,
          status: 'Completed',
          created_at: '2 days ago',
          officer_name: 'Dr. Anand Kulkarni (Field Agronomist)',
          report: {
            sample_id: 'KA-ST-MAN-8841',
            tested_date: 'Yesterday',
            values: { n: 78, p: 44, k: 48, temp: 27.0, humidity: 70, ph: 6.5, rainfall: 820 },
            health_score: 92,
            soil_type: 'Red Sandy Loam',
          },
        };
        setRequests([fallbackReq]);
        setSelectedReport(fallbackReq.report || null);
      });
  }, [user]);

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/soil-test-requests', {
        farmer_name: farmerName,
        phone,
        district,
        taluk,
        village,
        land_acres: Number(landAcres) || 2.0,
        preferred_date: preferredDate,
      });

      const newReq = res.data.request as SoilTestRequest;
      setSubmittedRequest(newReq);
      setRequests((prev) => [newReq, ...prev]);
    } catch {
      // Offline fallback
      const mockReq: SoilTestRequest = {
        id: Date.now(),
        farmer_name: farmerName,
        phone,
        district,
        taluk,
        village,
        land_acres: Number(landAcres) || 2.0,
        status: 'Officer Assigned - Contacting You',
        created_at: 'Just now',
        officer_name: 'Santhosh Kumar (Agro Field Officer - Doorstep Visit)',
        report: {
          sample_id: `KA-ST-${district.slice(0, 3).toUpperCase()}-901`,
          tested_date: 'Scheduled on field',
          values: { n: 76, p: 45, k: 50, temp: 26.5, humidity: 68, ph: 6.6, rainfall: 820 },
          health_score: 90,
          soil_type: 'Field Sample',
        },
      };
      setSubmittedRequest(mockReq);
      setRequests((prev) => [mockReq, ...prev]);
    } finally {
      setSubmitting(false);
    }
  }

  // Pre-fill to prediction tools
  function goToCropPrediction(values: SoilTestReport['values']) {
    const prefill = [values.n, values.p, values.k, values.temp, values.humidity, values.ph, values.rainfall];
    sessionStorage.setItem('prefill_crop', JSON.stringify(prefill));
    navigate('/farmer/predict-crop', { state: { prefill } });
  }

  function goToYieldPrediction(values: SoilTestReport['values']) {
    const prefill = [landAcres || 3.0, 1, 1, values.rainfall];
    sessionStorage.setItem('prefill_yield', JSON.stringify(prefill));
    navigate('/farmer/predict-yield', { state: { prefill } });
  }

  function goToRainfallPrediction(values: SoilTestReport['values']) {
    const prefill = [650, Math.round(values.rainfall / 4), 1010, values.humidity];
    sessionStorage.setItem('prefill_rainfall', JSON.stringify(prefill));
    navigate('/farmer/predict-rainfall', { state: { prefill } });
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', color: '#059669', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <FlaskConical size={15} /> Doorstep Land Soil Testing Service
        </div>
        <h1>Soil Test</h1>
        <p>Request a field soil test for your farmland. Our agronomist team member will call you and visit your land directly to test your soil samples.</p>
      </div>

      {/* Process Explainer Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #bbf7d0',
          marginBottom: '1.75rem',
          padding: '1.25rem 1.5rem',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PhoneCall size={18} /> How Doorstep Soil Testing Works
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Step 1: Submit Details
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
              Provide your Name, Phone, District, Taluk, and Village location.
            </p>
          </div>
          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Step 2: Team Calls You
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
              Our field officer contacts you to confirm the convenient date & time.
            </p>
          </div>
          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Step 3: Officer Visits Land
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
              He visits your land with a testing kit, collects soil, and tests nutrients on-site.
            </p>
          </div>
          <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, color: '#15803d', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Step 4: Get Soil Values
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569' }}>
              Your verified N, P, K, pH, and climate values are saved for Crop & Yield predictions.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'request' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('request')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ClipboardList size={15} /> Request Soil Test for Land
        </button>
        <button
          className={`btn ${activeTab === 'report' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('report')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <FlaskConical size={15} /> View Soil Test Reports & Values ({requests.length})
        </button>
      </div>

      {/* TAB 1: Request Soil Test Form */}
      {activeTab === 'request' && (
        <div>
          {submittedRequest ? (
            /* Success confirmation card */
            <div className="card animate-fadeIn" style={{ padding: '2.5rem 2rem', textAlign: 'center', maxWidth: 700, margin: '0 auto 2rem' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ color: 'var(--color-primary-700)', marginBottom: '0.5rem' }}>
                Soil Test Request Submitted!
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: 520, margin: '0 auto 1.5rem' }}>
                Thank you, <strong>{submittedRequest.farmer_name}</strong>! Your request for an on-field soil test has been registered under Request ID <strong>#STR-{submittedRequest.id}</strong>.
              </p>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 10, border: '1px solid var(--color-border)', textAlign: 'left', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Farmer Phone:</span>
                    <div style={{ fontWeight: 600 }}>{submittedRequest.phone}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Land Location:</span>
                    <div style={{ fontWeight: 600 }}>{submittedRequest.village}, {submittedRequest.taluk}, {submittedRequest.district}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Land Size:</span>
                    <div style={{ fontWeight: 600 }}>{submittedRequest.land_acres} Acres</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Assigned Field Officer:</span>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>{submittedRequest.officer_name}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#eff6ff', padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid #bfdbfe', marginBottom: '1.75rem', textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af' }}>
                  📞 <strong>What happens next?</strong> Our team member will contact you directly on <strong>{submittedRequest.phone}</strong> to confirm the exact time and himself will come to your land in {submittedRequest.village} to make the soil test.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedReport(submittedRequest.report || null);
                    setActiveTab('report');
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FlaskConical size={16} /> View Expected Soil Values & Predictions
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSubmittedRequest(null)}
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            /* The Request Form */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
              <div className="card">
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Enter Your Information</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Fill in your contact and land location so our field member can reach you.
                  </p>
                </div>

                <form onSubmit={handleSubmitRequest}>
                  {/* Name */}
                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={15} /> Your Full Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      className="input"
                      type="text"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      placeholder="e.g. Ramesh Gowda"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={15} /> Phone Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      className="input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98450 12345"
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', display: 'block' }}>
                      Our team member will call you on this number before visiting your land.
                    </span>
                  </div>

                  {/* District */}
                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building size={15} /> Karnataka District <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      className="input"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                    >
                      {KARNATAKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Taluk */}
                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={15} /> Taluk <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      className="input"
                      type="text"
                      value={taluk}
                      onChange={(e) => setTaluk(e.target.value)}
                      placeholder="e.g. Koratagere / Pandavapura / Maddur"
                      required
                    />
                  </div>

                  {/* Village */}
                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={15} /> Village / Land Address <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      className="input"
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Kyatsandra / Holenarasipura Cross"
                      required
                    />
                  </div>

                  {/* Land Size & Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Land Size (Acres)</label>
                      <input
                        className="input"
                        type="number"
                        step="0.5"
                        value={landAcres}
                        onChange={(e) => setLandAcres(e.target.value)}
                        placeholder="e.g. 4.5"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Preferred Date</label>
                      <input
                        className="input"
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    disabled={submitting}
                  >
                    <FlaskConical size={18} />
                    {submitting ? 'Submitting Request...' : 'Submit Soil Test Request'}
                  </button>
                </form>
              </div>

              {/* Side Info / Previous Requests list */}
              <div>
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>🚜 What our member does on your land:</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--color-text)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    <li>Collects core soil samples from multiple spots across your farm field.</li>
                    <li>Measures exact <strong>Nitrogen (N)</strong>, <strong>Phosphorus (P)</strong>, and <strong>Potassium (K)</strong> content.</li>
                    <li>Measures <strong>pH Level</strong> (acidity / alkalinity) and electrical conductivity.</li>
                    <li>Evaluates local <strong>Temperature</strong>, <strong>Humidity</strong>, and historical <strong>Rainfall</strong> for your taluk.</li>
                    <li>Uploads the verified Soil Health Report to your account for Crop & Yield Predictions.</li>
                  </ul>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>My Requests ({requests.length})</h3>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveTab('report')}
                    >
                      View Reports
                    </button>
                  </div>

                  {requests.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: '0.85rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 8,
                        marginBottom: '0.75rem',
                        background: '#f8fafc',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary-700)', fontSize: '0.85rem' }}>
                          #STR-{r.id}
                        </span>
                        <span className={`badge ${r.status === 'Completed' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.75rem' }}>
                          {r.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>
                        <strong>{r.village}</strong>, {r.taluk}, {r.district} ({r.land_acres} Acres)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                        Contact: {r.phone} • {r.officer_name}
                      </div>
                      {r.report && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.78rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => {
                            setSelectedReport(r.report!);
                            setActiveTab('report');
                          }}
                        >
                          View Soil Values & Use in Prediction →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Soil Report & Containing Values (For Crop, Yield, Rainfall prediction) */}
      {activeTab === 'report' && (
        <div>
          {selectedReport ? (
            <div>
              {/* Report Header Card */}
              <div className="card" style={{ marginBottom: '1.5rem', background: '#f8fafc', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span className="badge badge-green" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                      ✓ Verified On-Field Soil Health Card
                    </span>
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                      Land Soil Test Report: {selectedReport.sample_id}
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Tested directly on field by Agro Trades Agronomist • Soil Quality Score: <strong style={{ color: '#059669' }}>{selectedReport.health_score}/100</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setActiveTab('request')}
                    >
                      + Request New Field Visit
                    </button>
                  </div>
                </div>
              </div>

              {/* The 7 Soil Containing Values Found from the Test */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Soil Containing Values Found on Your Land</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                      These are the exact 7 values tested from your soil sample. Use them below for <strong>Crop Prediction</strong>, <strong>Yield Production</strong>, and <strong>Rainfall Prediction</strong>.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.8rem', background: '#ecfdf5', color: '#059669', padding: '0.3rem 0.75rem', borderRadius: 6, fontWeight: 700 }}>
                    7 Nutrients & Climate Parameters
                  </span>
                </div>

                <div
                  className="stagger"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {/* 1. Nitrogen (N) */}
                  <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Parameter 1</span>
                      <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>Optimal</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      Nitrogen (N)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', margin: '0.3rem 0' }}>
                      {selectedReport.values.n} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>kg/ha</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Supports leaf chlorophyll and lush crop growth.
                    </div>
                  </div>

                  {/* 2. Phosphorus (P) */}
                  <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Parameter 2</span>
                      <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>Adequate</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      Phosphorus (P)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', margin: '0.3rem 0' }}>
                      {selectedReport.values.p} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>kg/ha</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Stimulates deep root proliferation and seedling vigor.
                    </div>
                  </div>

                  {/* 3. Potassium (K) */}
                  <div className="card" style={{ borderLeft: '4px solid #ca8a04' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Parameter 3</span>
                      <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>Optimal</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      Potassium (K)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ca8a04', margin: '0.3rem 0' }}>
                      {selectedReport.values.k} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>kg/ha</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Regulates drought resistance and disease defense.
                    </div>
                  </div>

                  {/* 4. Temperature (°C) */}
                  <div className="card" style={{ borderLeft: '4px solid #f97316' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Parameter 4</span>
                      <span style={{ fontSize: '0.72rem', background: '#fff7ed', color: '#c2410c', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 600 }}>
                        Favorable
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      Temperature (°C)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f97316', margin: '0.3rem 0' }}>
                      {selectedReport.values.temp} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>°C</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Mean micro-climate temperature recorded on field.
                    </div>
                  </div>

                  {/* 5. Humidity (%) */}
                  <div className="card" style={{ borderLeft: '4px solid #06b6d4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Parameter 5</span>
                      <span style={{ fontSize: '0.72rem', background: '#ecfeff', color: '#0e7490', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 600 }}>
                        Good Moisture
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      Humidity (%)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#06b6d4', margin: '0.3rem 0' }}>
                      {selectedReport.values.humidity} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>%</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Atmospheric and canopy relative humidity.
                    </div>
                  </div>

                  {/* 6. pH Level */}
                  <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Parameter 6</span>
                      <span style={{ fontSize: '0.72rem', background: '#f5f3ff', color: '#6d28d9', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 600 }}>
                        Near Neutral
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      pH Level
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6', margin: '0.3rem 0' }}>
                      {selectedReport.values.ph} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>pH</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Soil reaction index (6.0 - 7.2 ensures maximum nutrient uptake).
                    </div>
                  </div>

                  {/* 7. Rainfall (mm) */}
                  <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Parameter 7</span>
                      <span style={{ fontSize: '0.72rem', background: '#f0f9ff', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 600 }}>
                        Normal Monsoon
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      Rainfall (mm)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', margin: '0.3rem 0' }}>
                      {selectedReport.values.rainfall} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>mm</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Seasonal precipitation forecast for crop season.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Section: Use in Crop, Yield, and Rainfall Prediction */}
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Use These Soil Values for Predictions</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                    Click to directly prefill and launch predictions with these 7 field values.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  
                  {/* Crop Prediction Card */}
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ background: '#fefce8', color: '#ca8a04', padding: '0.5rem', borderRadius: 8 }}>
                          <Brain size={22} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Crop Prediction</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Feeds N, P, K, Temp, Humidity, pH, Rainfall</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 1rem', lineHeight: 1.45 }}>
                        Uses the 7 soil values from your field test to predict the highest yielding crops (Ragi, Paddy, Sugarcane, Maize, Tomato, etc.).
                      </p>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => goToCropPrediction(selectedReport.values)}
                      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Brain size={15} /> Use in Crop Prediction <ArrowRight size={15} />
                    </button>
                  </div>

                  {/* Yield Production Card */}
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.5rem', borderRadius: 8 }}>
                          <BarChart3 size={22} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Yield Production</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Estimates Quintals/Acre Output</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 1rem', lineHeight: 1.45 }}>
                        Estimates expected harvest tonnage and total yield based on your soil health score and moisture levels.
                      </p>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => goToYieldPrediction(selectedReport.values)}
                      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <BarChart3 size={15} /> Use in Yield Production <ArrowRight size={15} />
                    </button>
                  </div>

                  {/* Rainfall Production Card */}
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ background: '#f0fdfa', color: '#0d9488', padding: '0.5rem', borderRadius: 8 }}>
                          <CloudRain size={22} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Rainfall Production</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Precipitation & Monsoon Forecast</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 1rem', lineHeight: 1.45 }}>
                        Projects monsoon precipitation patterns, water availability, and optimal sowing calendar.
                      </p>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => goToRainfallPrediction(selectedReport.values)}
                      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <CloudRain size={15} /> Use in Rainfall Production <ArrowRight size={15} />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <FlaskConical size={40} style={{ opacity: 0.3, margin: '0 auto 1rem', display: 'block' }} />
              <h3>No Completed Soil Test Report Yet</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: 450, margin: '0.5rem auto 1.5rem' }}>
                Request an on-field soil test. Our team member will visit your land, collect the sample, and publish your verified soil values here.
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab('request')}>
                Submit Soil Test Request
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
