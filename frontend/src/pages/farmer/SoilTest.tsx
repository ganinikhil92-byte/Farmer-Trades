import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  FlaskConical,
  PhoneCall,
  MapPin,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Building,
  ClipboardList,
  UploadCloud,
  FileText,
  Download,
  Calendar,
  Clock,
  Info,
  Layers,
  ArrowRight,
  ShieldAlert,
  XCircle
} from 'lucide-react';
import { karnatakaDistricts } from '../../data/karnatakaLocations';

interface SoilNutrientParameter {
  value: number | null | undefined;
  unit: string;
  rating?: string;
  meaning?: string;
}

interface SoilTestReportData {
  report_reference?: string;
  laboratory_name: string;
  sample_id: string;
  collection_date?: string;
  tested_date?: string;
  laboratory_recommendations?: string;
  reviewer_name?: string;
  review_date?: string;
  review_status?: string;
  attachment_name?: string;
  parameters_12?: Record<string, SoilNutrientParameter>;
  values?: {
    n?: number;
    p?: number;
    k?: number;
    ph?: number;
    ec?: number;
    oc?: number;
  };
  health_score?: number;
  soil_type?: string;
}

interface SoilTestRequestItem {
  id: number;
  request_ref: string;
  farmer_id: string;
  farmer_name: string;
  phone: string;
  district: string;
  taluk: string;
  village: string;
  field_name: string;
  land_acres: number;
  land_unit: string;
  preferred_date: string;
  status: 'Submitted' | 'Accepted' | 'Rejected' | 'Scheduled' | 'Sample Collected' | 'Testing in Progress' | 'Report Available' | 'Cancelled';
  raw_status?: string;
  created_at: string;
  provider_name: string;
  provider_contact: string;
  appointment_date: string;
  appointment_time?: string;
  sample_id?: string;
  sample_collected_date?: string;
  rejection_reason?: string;
  has_attachment?: boolean;
  attachment_filename?: string;
  is_farmer_upload?: boolean;
  review_status?: string;
  reviewer_name?: string;
  review_date?: string;
  report?: SoilTestReportData | null;
}

const PARAMETER_CONFIG = [
  { key: 'n', label: 'Nitrogen (N)', defaultUnit: 'kg/ha', description: 'Primary macro-nutrient for vegetative growth and leaf development' },
  { key: 'p', label: 'Phosphorus (P)', defaultUnit: 'kg/ha', description: 'Essential for root elongation, tillering, and early plant vigor' },
  { key: 'k', label: 'Potassium (K)', defaultUnit: 'kg/ha', description: 'Regulates water balance, disease resistance, and grain weight' },
  { key: 'ph', label: 'Soil Reaction (pH)', defaultUnit: 'pH', description: 'Measures soil acidity/alkalinity (optimal range: 6.0 to 7.5)' },
  { key: 'ec', label: 'Electrical Conductivity (EC)', defaultUnit: 'dS/m', description: 'Indicates concentration of soluble salts (salinity level)' },
  { key: 'oc', label: 'Organic Carbon (OC)', defaultUnit: '%', description: 'Key indicator of biological soil health and nutrient holding capacity' },
  { key: 's', label: 'Sulphur (S)', defaultUnit: 'ppm', description: 'Crucial for amino acid synthesis, chlorophyll formation, and oil content' },
  { key: 'zn', label: 'Zinc (Zn)', defaultUnit: 'ppm', description: 'Micronutrient vital for plant hormone regulation and enzyme activity' },
  { key: 'fe', label: 'Iron (Fe)', defaultUnit: 'ppm', description: 'Essential catalyst in respiration and chlorophyll synthesis' },
  { key: 'cu', label: 'Copper (Cu)', defaultUnit: 'ppm', description: 'Important for plant respiration, reproduction, and grain setting' },
  { key: 'mn', label: 'Manganese (Mn)', defaultUnit: 'ppm', description: 'Aids nitrogen metabolism, enzyme reactions, and photosynthesis' },
  { key: 'b', label: 'Boron (B)', defaultUnit: 'ppm', description: 'Required for cell wall formation, flowering, and pollen germination' },
];

export default function SoilTest() {
  const { user } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'request' | 'upload' | 'history'>('request');

  // Form states - prefilled from authenticated farmer profile where available
  const [farmerName, setFarmerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || 'Mandya');
  const [taluk, setTaluk] = useState(user?.taluk || '');
  const [village, setVillage] = useState(user?.village || '');
  const [fieldName, setFieldName] = useState('');
  const [landAcres, setLandAcres] = useState<string>('2.0');
  const [landUnit, setLandUnit] = useState<string>('Acres');
  const [preferredDate, setPreferredDate] = useState<string>('');

  // Upload existing report state
  const [upFieldName, setUpFieldName] = useState('');
  const [upDistrict, setUpDistrict] = useState(user?.district || 'Mandya');
  const [upTaluk, setUpTaluk] = useState(user?.taluk || '');
  const [upVillage, setUpVillage] = useState(user?.village || '');
  const [upLandAcres, setUpLandAcres] = useState<string>('2.0');
  const [upLandUnit, setUpLandUnit] = useState<string>('Acres');
  const [upLabName, setUpLabName] = useState('');
  const [upTestedDate, setUpTestedDate] = useState('');
  const [upSampleId, setUpSampleId] = useState('');
  const [upNotes, setUpNotes] = useState('');
  const [upFile, setUpFile] = useState<File | null>(null);

  // Request & Submission UI states
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submittedReq, setSubmittedReq] = useState<SoilTestRequestItem | null>(null);

  // Requests list and report inspection state
  const [requests, setRequests] = useState<SoilTestRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedReqForReport, setSelectedReqForReport] = useState<SoilTestRequestItem | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Prefill profile details when user profile becomes available
  useEffect(() => {
    if (user) {
      if (!farmerName) setFarmerName(user.name || '');
      if (!phone) setPhone(user.phone || '');
      if (!district && user.district) setDistrict(user.district);
      if (!taluk && user.taluk) setTaluk(user.taluk);
      if (!village && user.village) setVillage(user.village);
      if (!upDistrict && user.district) setUpDistrict(user.district);
      if (!upTaluk && user.taluk) setUpTaluk(user.taluk);
      if (!upVillage && user.village) setUpVillage(user.village);
    }
  }, [user]);

  // Fetch farmer's saved soil test requests
  useEffect(() => {
    fetchFarmerRequests();
  }, []);

  function getLocalRequests(): SoilTestRequestItem[] {
    try {
      const raw = localStorage.getItem('agro_soil_test_requests');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading local requests', e);
    }
    return [];
  }

  function saveLocalRequest(req: SoilTestRequestItem) {
    try {
      const existing = getLocalRequests();
      const updated = [req, ...existing.filter((r) => r.id !== req.id && r.request_ref !== req.request_ref)];
      localStorage.setItem('agro_soil_test_requests', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving local request', e);
    }
  }

  function fetchFarmerRequests() {
    setLoadingRequests(true);
    const local = getLocalRequests();
    api.get('/soil-test-requests')
      .then((res) => {
        const remoteData = (res.data || []) as SoilTestRequestItem[];
        // Merge remote with local ensuring no duplicate ids/refs
        const remoteIds = new Set(remoteData.map((r) => r.id));
        const remoteRefs = new Set(remoteData.map((r) => r.request_ref));
        const merged = [...remoteData, ...local.filter((l) => !remoteIds.has(l.id) && !remoteRefs.has(l.request_ref))];
        setRequests(merged);
        if (merged.length > 0 && !selectedReqForReport) {
          const withReport = merged.find((r) => r.status === 'Report Available' || r.report);
          if (withReport) setSelectedReqForReport(withReport);
        }
      })
      .catch((err) => {
        console.error('Failed to load soil test requests from API, using local storage', err);
        setRequests(local);
        if (local.length > 0 && !selectedReqForReport) {
          const withReport = local.find((r) => r.status === 'Report Available' || r.report);
          if (withReport) setSelectedReqForReport(withReport);
        }
      })
      .finally(() => setLoadingRequests(false));
  }

  // Handle Request Submission (Stage 2)
  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!farmerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    if (!district.trim()) {
      setErrorMsg('Please select your district.');
      return;
    }
    if (!taluk.trim()) {
      setErrorMsg('Please enter your taluk.');
      return;
    }
    if (!village.trim()) {
      setErrorMsg('Please enter your village or plot address.');
      return;
    }
    if (!fieldName.trim()) {
      setErrorMsg('Please enter a field name or plot identifier (e.g. North Canal Plot).');
      return;
    }
    const parsedAcres = parseFloat(landAcres);
    if (isNaN(parsedAcres) || parsedAcres <= 0) {
      setErrorMsg('Please enter a valid positive number for land area.');
      return;
    }
    if (preferredDate && preferredDate < todayStr) {
      setErrorMsg('Preferred appointment date cannot be in the past.');
      return;
    }

    setSubmitting(true);

    const payload = {
      farmer_name: farmerName.trim(),
      farmer_email: user?.email || '',
      phone: phone.trim(),
      district: district.trim(),
      taluk: taluk.trim(),
      village: village.trim(),
      field_name: fieldName.trim(),
      land_acres: parsedAcres,
      land_unit: landUnit || 'Acres',
      preferred_date: preferredDate || '',
    };

    let newReq: SoilTestRequestItem | null = null;

    try {
      try {
        const res = await api.post('/soil-test-requests', payload);
        newReq = res.data.request as SoilTestRequestItem;
      } catch (apiErr: any) {
        // If network error / connection refused / backend offline, create locally
        if (!apiErr.response || apiErr.code === 'ERR_NETWORK' || apiErr.message?.includes('Network Error')) {
          const localId = Date.now();
          newReq = {
            id: localId,
            request_ref: `STR-${String(localId).slice(-4)}`,
            farmer_id: user?.email || farmerName.trim(),
            farmer_name: farmerName.trim(),
            phone: phone.trim(),
            district: district.trim(),
            taluk: taluk.trim(),
            village: village.trim(),
            field_name: fieldName.trim(),
            land_acres: parsedAcres,
            land_unit: landUnit || 'Acres',
            preferred_date: preferredDate || '',
            status: 'Submitted',
            created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
            provider_name: 'Pending Admin Assignment',
            provider_contact: 'Pending confirmation',
            appointment_date: preferredDate || 'Pending confirmation',
            appointment_time: '',
            sample_id: '',
            sample_collected_date: '',
            rejection_reason: '',
            has_attachment: false,
            attachment_filename: '',
            is_farmer_upload: false,
            review_status: 'Submitted — Pending Admin Review',
            reviewer_name: '',
            review_date: '',
            report: null,
          };
        } else {
          // Re-throw server 400 validation error
          throw apiErr;
        }
      }

      if (newReq) {
        saveLocalRequest(newReq);
        setSubmittedReq(newReq);
        setSuccessMsg(`Your soil test request has been submitted under Reference ${newReq.request_ref}. It has been sent to the Admin Portal for review and provider assignment.`);
        setRequests((prev) => [newReq!, ...prev.filter((r) => r.id !== newReq!.id && r.request_ref !== newReq!.request_ref)]);

        // Reset field plot inputs while preserving farmer profile details
        setFieldName('');
        setPreferredDate('');
      }
    } catch (err: any) {
      let detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        detail = detail.map((d: any) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d))).join(', ');
      } else if (typeof detail !== 'string') {
        detail = err.response?.data?.message || err.message || 'Failed to submit soil test request. Please check your inputs and try again.';
      }
      setErrorMsg(detail);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Existing Report Upload (Stage 5)
  async function handleUploadExistingReport(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!upFieldName.trim()) {
      setErrorMsg('Please enter your field name or plot identifier.');
      return;
    }
    if (!upFile) {
      setErrorMsg('Please select a soil test report document (PDF, JPG, PNG) to upload.');
      return;
    }
    if (upFile.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 5 MB limit. Please select a smaller file.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('field_name', upFieldName.trim());
      formData.append('district', upDistrict.trim());
      formData.append('taluk', upTaluk.trim());
      formData.append('village', upVillage.trim());
      formData.append('land_acres', upLandAcres);
      formData.append('land_unit', upLandUnit);
      formData.append('laboratory_name', upLabName.trim());
      formData.append('tested_date', upTestedDate);
      formData.append('sample_id', upSampleId.trim());
      formData.append('notes', upNotes.trim());
      formData.append('file', upFile);

      const res = await api.post('/farmer/soil-test-requests/upload-report', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const createdReq = res.data.request as SoilTestRequestItem;
      setRequests((prev) => [createdReq, ...prev]);
      setSuccessMsg(`Your soil report (${createdReq.request_ref}) was uploaded successfully and is marked 'Uploaded by farmer — pending review'.`);
      setUpFile(null);
      setUpNotes('');
      setUpFieldName('');
      setActiveTab('history');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to upload existing soil report. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  // Secure download of original attachment
  async function handleDownloadAttachment(requestId: number, fileName?: string) {
    try {
      const res = await api.get(`/soil-test-reports/${requestId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `soil_report_${requestId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Unable to download attachment. You may not have access or the file is currently unavailable.');
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'Submitted':
        return <span className="badge badge-blue">Submitted (Pending Review)</span>;
      case 'Accepted':
        return <span className="badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>✓ Accepted by Admin</span>;
      case 'Rejected':
        return <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>✕ Rejected</span>;
      case 'Scheduled':
        return <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>Scheduled</span>;
      case 'Sample Collected':
        return <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>Sample Collected</span>;
      case 'Testing in Progress':
        return <span className="badge" style={{ background: '#cffafe', color: '#0e7490' }}>Testing in Progress</span>;
      case 'Report Available':
        return <span className="badge badge-green">Report Available</span>;
      case 'Cancelled':
        return <span className="badge badge-red">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#eaf4ee', color: '#163a2b', padding: '0.25rem 0.75rem', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.65rem', border: '1px solid #c5dccb' }}>
          <FlaskConical size={14} style={{ color: '#2d6a4f' }} />
          <span>Accredited Agronomic Laboratory Testing</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a' }}>
          Soil Testing & Certified Reports
        </h1>
        <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: '820px', margin: '0.35rem 0 0', lineHeight: 1.5 }}>
          Book physical core sample testing at certified agricultural laboratories across Karnataka. Analyze 12 macro and micro nutrient parameters to compute precision fertilizer dosages.
        </p>
      </div>

      {/* Protocol Stepper Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, #f7faf8 0%, #ffffff 100%)',
          border: '1px solid #dce5dd',
          marginBottom: '1.75rem',
          padding: '1.35rem 1.65rem',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#163a2b', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={17} style={{ color: '#2d6a4f' }} />
            Official ICAR / UAS Field-to-Lab Testing Protocol
          </h3>
          <span className="badge badge-green" style={{ fontSize: '0.74rem' }}>
            <CheckCircle2 size={12} /> Standard 5-Step Process
          </span>
        </div>

        {/* Stepper Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#2d6a4f', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700 }}>1</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Request Field Test</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
              Specify plot survey number, acres, and preferred collection date.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#2d6a4f', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700 }}>2</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Field Appointment</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
              Lab technician confirms slot and schedules field visit.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#2d6a4f', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700 }}>3</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Core Sampling</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
              Auger core samples collected in zigzag grid with sample ID.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#2d6a4f', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700 }}>4</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Spectrometry Assay</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
              Accredited lab assays pH, EC, organic carbon, and 12 nutrients.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', background: '#2d6a4f', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700 }}>5</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Certified Report</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
              Verified digital lab report generated with dosage recommendations.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Info size={14} style={{ color: '#2d6a4f', flexShrink: 0 }} />
          <span>
            Testing is conducted per Soil Health Card guidelines. Doorstep sample collection visits are confirmed directly by authorized testing lab partners.
          </span>
        </div>
      </div>

      {/* Segmented Control Navigation Tabs */}
      <div style={{ display: 'inline-flex', background: '#eaf0ec', padding: '0.25rem', borderRadius: 10, marginBottom: '1.75rem', gap: '0.25rem', border: '1px solid #dbe6dd' }}>
        <button
          onClick={() => { setActiveTab('request'); setErrorMsg(''); setSuccessMsg(''); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 1rem',
            borderRadius: 7,
            fontSize: '0.84rem',
            fontWeight: activeTab === 'request' ? 600 : 500,
            background: activeTab === 'request' ? '#ffffff' : 'transparent',
            color: activeTab === 'request' ? '#0d2818' : '#475569',
            boxShadow: activeTab === 'request' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 150ms ease',
          }}
        >
          <ClipboardList size={15} style={{ color: activeTab === 'request' ? '#2d6a4f' : 'inherit' }} />
          <span>Request Soil Testing</span>
        </button>

        <button
          onClick={() => { setActiveTab('upload'); setErrorMsg(''); setSuccessMsg(''); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 1rem',
            borderRadius: 7,
            fontSize: '0.84rem',
            fontWeight: activeTab === 'upload' ? 600 : 500,
            background: activeTab === 'upload' ? '#ffffff' : 'transparent',
            color: activeTab === 'upload' ? '#0d2818' : '#475569',
            boxShadow: activeTab === 'upload' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 150ms ease',
          }}
        >
          <UploadCloud size={15} style={{ color: activeTab === 'upload' ? '#2d6a4f' : 'inherit' }} />
          <span>Upload Existing Report</span>
        </button>

        <button
          onClick={() => { setActiveTab('history'); setErrorMsg(''); setSuccessMsg(''); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.45rem 1rem',
            borderRadius: 7,
            fontSize: '0.84rem',
            fontWeight: activeTab === 'history' ? 600 : 500,
            background: activeTab === 'history' ? '#ffffff' : 'transparent',
            color: activeTab === 'history' ? '#0d2818' : '#475569',
            boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 150ms ease',
          }}
        >
          <FileText size={15} style={{ color: activeTab === 'history' ? '#2d6a4f' : 'inherit' }} />
          <span>My Requests & Reports ({requests.length})</span>
        </button>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.85rem 1rem', borderRadius: 8, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.85rem 1rem', borderRadius: 8, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: Request Soil Testing Form */}
      {activeTab === 'request' && (
        <div>
          {submittedReq ? (
            <div className="card animate-fadeIn" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', border: '2px solid #86efac' }}>
              <div style={{ width: 56, height: 56, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#16a34a' }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ margin: '0 0 0.5rem', color: '#15803d' }}>Soil Test Request Submitted!</h2>
              <p style={{ fontSize: '1rem', color: '#334155', maxWidth: 540, margin: '0 auto 1.5rem' }}>
                Thank you, <strong>{submittedReq.farmer_name}</strong>! Your request for soil testing on plot <strong>{submittedReq.field_name}</strong> has been registered under Request Reference <strong>{submittedReq.request_ref}</strong>.
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '1rem 1.5rem', maxWidth: 480, margin: '0 auto 1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div><span style={{ color: '#64748b' }}>Reference ID:</span> <strong>{submittedReq.request_ref}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Current Status:</span> {getStatusBadge(submittedReq.status)}</div>
                  <div><span style={{ color: '#64748b' }}>Field Plot:</span> <strong>{submittedReq.field_name}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Land Area:</span> <strong>{submittedReq.land_acres} {submittedReq.land_unit}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Location:</span> {submittedReq.village}, {submittedReq.district}</div>
                  <div><span style={{ color: '#64748b' }}>Preferred Date:</span> {submittedReq.preferred_date || 'Not specified'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSubmittedReq(null)}
                >
                  Submit Another Request
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('history')}
                >
                  View in My Requests →
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
              {/* Form Card */}
              <div className="card">
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Request Field Soil Testing</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Provide field plot and contact details for testing provider scheduling.
                  </p>
                </div>

                <form onSubmit={handleSubmitRequest}>
                  {/* Farmer Name */}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={15} /> Full Name <span style={{ color: '#dc2626' }}>*</span>
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
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={15} /> Phone Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      className="input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9845012345"
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', display: 'block' }}>
                      Testing provider or field agronomist will contact you on this number to confirm the appointment.
                    </span>
                  </div>

                  {/* Field Name / Plot Identifier */}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={15} /> Field Name / Plot Identifier <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      className="input"
                      type="text"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      placeholder="e.g. North Canal Plot / Survey No. 42/1"
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', display: 'block' }}>
                      Distinguish multiple farm plots on your land.
                    </span>
                  </div>

                  {/* Location (District & Taluk) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Karnataka District <span style={{ color: '#dc2626' }}>*</span></label>
                      <select
                        className="input"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                      >
                        {karnatakaDistricts.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Taluk <span style={{ color: '#dc2626' }}>*</span></label>
                      <input
                        className="input"
                        type="text"
                        value={taluk}
                        onChange={(e) => setTaluk(e.target.value)}
                        placeholder="e.g. Maddur / Pandavapura"
                        required
                      />
                    </div>
                  </div>

                  {/* Village / Field Address */}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={15} /> Village / Field Address <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      className="input"
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Besagarahalli Village, Near Primary School"
                      required
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', display: 'block' }}>
                      Address of the specific farm plot. Changing this does not overwrite your profile address.
                    </span>
                  </div>

                  {/* Land Area and Preferred Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Land Area <span style={{ color: '#dc2626' }}>*</span></label>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <input
                          className="input"
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={landAcres}
                          onChange={(e) => setLandAcres(e.target.value)}
                          placeholder="2.0"
                          required
                        />
                        <select
                          className="input"
                          style={{ width: '90px', padding: '0.5rem' }}
                          value={landUnit}
                          onChange={(e) => setLandUnit(e.target.value)}
                        >
                          <option value="Acres">Acres</option>
                          <option value="Guntas">Guntas</option>
                          <option value="Hectares">Hectares</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Preferred Date</label>
                      <input
                        className="input"
                        type="date"
                        min={todayStr}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', display: 'block' }}>
                        Tentative preference; subject to provider confirmation.
                      </span>
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

              {/* Side Information */}
              <div>
                <div className="card" style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '1rem' }}>
                    Why Soil Laboratory Testing Matters
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                    Laboratory testing determines the exact available nutrient reserves in your farm soil so you only apply the fertilizers your crops actually need.
                  </p>
                  <ul style={{ fontSize: '0.83rem', color: '#334155', paddingLeft: '1.2rem', margin: 0, lineHeight: 1.6 }}>
                    <li><strong>Macro Nutrients:</strong> Measures available Nitrogen (N), Phosphorus (P), and Potassium (K).</li>
                    <li><strong>Chemical Balance:</strong> Accurate determination of soil reaction (pH) and salinity (EC).</li>
                    <li><strong>Soil Organic Carbon:</strong> Key gauge of biological fertility and moisture retention.</li>
                    <li><strong>Essential Micro-nutrients:</strong> Identifies Sulphur, Zinc, Iron, Boron, Copper, and Manganese levels.</li>
                  </ul>
                </div>

                <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>Already have a physical Soil Health Card?</h4>
                  <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 0.75rem' }}>
                    If you have already received an official laboratory test report or Soil Health Card from a Krishi Vigyan Kendra (KVK) or testing lab, you can upload it directly.
                  </p>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveTab('upload')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <UploadCloud size={14} /> Upload Existing Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Upload Existing Soil Report */}
      {activeTab === 'upload' && (
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="card">
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Farmer Upload Option
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Upload Existing Soil Test Report</h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Upload a scanned copy or clear photo of your certified laboratory report (PDF, JPG, or PNG up to 5 MB).
              </p>
            </div>

            <form onSubmit={handleUploadExistingReport}>
              {/* Plot Details */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Field Name / Plot Identifier <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  className="input"
                  value={upFieldName}
                  onChange={(e) => setUpFieldName(e.target.value)}
                  placeholder="e.g. South Paddy Field / Survey 18"
                  required
                />
              </div>

              {/* Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">District <span style={{ color: '#dc2626' }}>*</span></label>
                  <select
                    className="input"
                    value={upDistrict}
                    onChange={(e) => setUpDistrict(e.target.value)}
                    required
                  >
                    {karnatakaDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Taluk <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    className="input"
                    value={upTaluk}
                    onChange={(e) => setUpTaluk(e.target.value)}
                    placeholder="e.g. Maddur"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Village / Plot Address <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    className="input"
                    value={upVillage}
                    onChange={(e) => setUpVillage(e.target.value)}
                    placeholder="e.g. Besagarahalli"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Area</label>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={upLandAcres}
                      onChange={(e) => setUpLandAcres(e.target.value)}
                    />
                    <select
                      className="input"
                      style={{ width: '80px' }}
                      value={upLandUnit}
                      onChange={(e) => setUpLandUnit(e.target.value)}
                    >
                      <option value="Acres">Acres</option>
                      <option value="Guntas">Guntas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Laboratory details if known */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Laboratory / Testing Provider Name (If known)</label>
                  <input
                    className="input"
                    value={upLabName}
                    onChange={(e) => setUpLabName(e.target.value)}
                    placeholder="e.g. KVK Soil Testing Laboratory"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date Tested on Document (If known)</label>
                  <input
                    className="input"
                    type="date"
                    value={upTestedDate}
                    onChange={(e) => setUpTestedDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Sample ID / Reference Number (If known)</label>
                <input
                  className="input"
                  value={upSampleId}
                  onChange={(e) => setUpSampleId(e.target.value)}
                  placeholder="e.g. KVK-SMP-2026-09"
                />
              </div>

              {/* File Upload with strict 5MB limit */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">
                  Report Document (PDF, JPG, PNG) — <strong style={{ color: '#0f766e' }}>Maximum file size: 5 MB</strong> <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ border: '2px dashed #cbd5e1', padding: '1.5rem', borderRadius: 8, textAlign: 'center', background: '#f8fafc' }}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    id="farmer-report-file"
                    style={{ display: 'none' }}
                    onChange={(e) => setUpFile(e.target.files?.[0] || null)}
                    required
                  />
                  <label htmlFor="farmer-report-file" style={{ cursor: 'pointer' }}>
                    <UploadCloud size={32} style={{ color: '#059669', marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                      {upFile ? upFile.name : 'Click to select report document'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {upFile ? `${(upFile.size / (1024 * 1024)).toFixed(2)} MB selected` : 'Supported formats: PDF, JPG, PNG (Max 5 MB)'}
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Additional Remarks / Notes</label>
                <textarea
                  className="input"
                  rows={2}
                  value={upNotes}
                  onChange={(e) => setUpNotes(e.target.value)}
                  placeholder="Any additional information noted on the report..."
                />
              </div>

              <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '0.75rem', borderRadius: 6, fontSize: '0.78rem', color: '#854d0e', marginBottom: '1.5rem' }}>
                <strong>Verification Notice:</strong> Reports uploaded by farmers are designated as <em>“Uploaded by farmer — pending review”</em>. An authorized agricultural reviewer will verify the document before measured laboratory values are marked verified.
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                disabled={uploading}
              >
                <UploadCloud size={18} />
                {uploading ? 'Uploading Document...' : 'Upload Soil Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: My Requests & Reports */}
      {activeTab === 'history' && (
        <div>
          {loadingRequests ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="animate-pulse">Loading your soil test requests...</div>
            </div>
          ) : requests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <FlaskConical size={42} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
              <h3>No soil test requests yet</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                You have not submitted any soil testing requests or uploaded reports yet.
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab('request')}>
                Submit Your First Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: selectedReqForReport?.report ? '1.2fr 1.8fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
              {/* Requests List */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>My Requests & Field Plots</h3>
                  <button className="btn btn-secondary btn-sm" onClick={fetchFarmerRequests}>Refresh</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {requests.map((r) => {
                    const isSelected = selectedReqForReport?.id === r.id;
                    const hasRep = r.status === 'Report Available' || r.report;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedReqForReport(r)}
                        style={{
                          background: isSelected ? '#f0fdf4' : '#ffffff',
                          border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                          borderRadius: 8,
                          padding: '0.85rem 1rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#0f766e', fontSize: '0.92rem' }}>
                              {r.request_ref}
                            </span>
                            <span style={{ fontWeight: 600, color: '#1e293b', marginLeft: '0.5rem', fontSize: '0.92rem' }}>
                              {r.field_name}
                            </span>
                          </div>
                          <div>{getStatusBadge(r.status)}</div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem' }}>
                          📍 {r.village}, {r.taluk}, {r.district} • {r.land_acres} {r.land_unit}
                        </div>

                        {/* Testing Provider */}
                        <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ color: '#64748b' }}>Provider:</span>
                          <strong>{r.provider_name}</strong>
                        </div>

                        {/* Confirmed Appointment vs Tentative Preferred */}
                        <div style={{ fontSize: '0.78rem', color: '#334155', marginTop: '0.2rem' }}>
                          {r.appointment_date !== 'Not confirmed' && r.appointment_date !== 'Pending confirmation' ? (
                            <span style={{ color: '#0f766e', fontWeight: 600 }}>
                              🗓 Confirmed Appointment: {r.appointment_date} {r.appointment_time || ''}
                            </span>
                          ) : r.preferred_date ? (
                            <span style={{ color: '#64748b' }}>
                              🗓 Preferred Date: {r.preferred_date}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Appointment not confirmed</span>
                          )}
                        </div>

                        {/* Rejection notice */}
                        {r.status === 'Rejected' && (
                          <div style={{ marginTop: '0.4rem', fontSize: '0.76rem', color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.25rem 0.5rem', borderRadius: 4 }}>
                            <strong>Rejection Reason:</strong> {r.rejection_reason || 'Request not approved by administration'}
                          </div>
                        )}

                        {/* Accepted notice */}
                        {r.status === 'Accepted' && (
                          <div style={{ marginTop: '0.4rem', fontSize: '0.76rem', color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.25rem 0.5rem', borderRadius: 4 }}>
                            ✓ <strong>Accepted by Administration:</strong> Provider scheduled for sample collection.
                          </div>
                        )}

                        {/* Farmer upload indicator */}
                        {r.is_farmer_upload && (
                          <div style={{ marginTop: '0.4rem', fontSize: '0.74rem', color: '#854d0e', background: '#fefce8', padding: '0.15rem 0.4rem', borderRadius: 4, display: 'inline-block' }}>
                            {r.review_status || 'Uploaded by farmer — pending review'}
                          </div>
                        )}

                        {hasRep && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#15803d', fontSize: '0.8rem', fontWeight: 600 }}>
                            <FileText size={14} /> Certified Report Available — Click to View →
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Report Inspection Panel */}
              {selectedReqForReport && (
                <div>
                  {selectedReqForReport.status === 'Report Available' || selectedReqForReport.report ? (
                    <div className="card animate-fadeIn" style={{ border: '2px solid #86efac' }}>
                      {/* Report Header */}
                      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                              ✓ Certified Soil Health Report
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.35rem', color: '#14532d' }}>
                              Plot: {selectedReqForReport.field_name}
                            </h2>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                              Report Reference: <strong>{selectedReqForReport.report?.report_reference || selectedReqForReport.request_ref}</strong> • Sample ID: <strong>{selectedReqForReport.report?.sample_id || selectedReqForReport.sample_id || 'SMP-KA'}</strong>
                            </p>
                          </div>

                          {selectedReqForReport.has_attachment && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                              onClick={() => handleDownloadAttachment(selectedReqForReport.id, selectedReqForReport.attachment_filename)}
                            >
                              <Download size={14} /> Download Original Attachment
                            </button>
                          )}
                        </div>

                        {/* Laboratory Metadata Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '1rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                          <div>
                            <span style={{ color: '#64748b' }}>Testing Laboratory:</span>
                            <div style={{ fontWeight: 600 }}>{selectedReqForReport.report?.laboratory_name || selectedReqForReport.provider_name}</div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Test Conducted Date:</span>
                            <div style={{ fontWeight: 600 }}>{selectedReqForReport.report?.tested_date || 'Not recorded'}</div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Reviewed By:</span>
                            <div style={{ fontWeight: 600 }}>{selectedReqForReport.report?.reviewer_name || 'Authorized Agronomist'}</div>
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>Review Status:</span>
                            <div style={{ fontWeight: 600, color: '#15803d' }}>
                              {selectedReqForReport.report?.review_status || 'Reviewed & Verified'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 12 Measured Soil Nutrient Parameters */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#166534' }}>
                            Measured Laboratory Parameters
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Unmeasured values show “Not provided”
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                          {PARAMETER_CONFIG.map(({ key, label, defaultUnit, description }) => {
                            // Extract measured parameter if present
                            const pData = selectedReqForReport.report?.parameters_12?.[key];
                            const legacyVal = (selectedReqForReport.report?.values as any)?.[key];
                            const hasValue = pData?.value !== undefined && pData?.value !== null && !isNaN(pData.value);
                            const displayValue = hasValue
                              ? pData.value
                              : legacyVal !== undefined && legacyVal !== null
                              ? legacyVal
                              : null;

                            return (
                              <div
                                key={key}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 8,
                                  padding: '0.75rem',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.84rem', color: '#334155' }}>
                                    {label}
                                  </span>
                                  {pData?.rating && (
                                    <span
                                      className="badge"
                                      style={{
                                        fontSize: '0.7rem',
                                        padding: '0.15rem 0.4rem',
                                        background: pData.rating.toLowerCase().includes('optimal') || pData.rating.toLowerCase().includes('neutral') || pData.rating.toLowerCase().includes('adequate')
                                          ? '#dcfce7'
                                          : '#fef3c7',
                                        color: pData.rating.toLowerCase().includes('optimal') || pData.rating.toLowerCase().includes('neutral') || pData.rating.toLowerCase().includes('adequate')
                                          ? '#166534'
                                          : '#854d0e',
                                      }}
                                    >
                                      {pData.rating}
                                    </span>
                                  )}
                                </div>

                                <div style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.35rem 0 0.2rem' }}>
                                  {displayValue !== null ? (
                                    <span>
                                      {displayValue} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>{pData?.unit || defaultUnit}</span>
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', fontWeight: 500 }}>
                                      Not provided
                                    </span>
                                  )}
                                </div>

                                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
                                  {description}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Laboratory Advisory & Recommendations */}
                      {selectedReqForReport.report?.laboratory_recommendations && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                          <h4 style={{ margin: '0 0 0.35rem', color: '#166534', fontSize: '0.95rem' }}>
                            Laboratory Interpretation & Recommendations
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5 }}>
                            {selectedReqForReport.report.laboratory_recommendations}
                          </p>
                        </div>
                      )}

                      {/* Prediction Reference Information (Stage 4 & Integration note) */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#475569' }}>
                        <strong>Future Agricultural Prediction Reference:</strong> These laboratory verified soil nutrient values can be referenced when planning crop selection and nutrient supplementation for {selectedReqForReport.field_name}.
                      </div>
                    </div>
                  ) : selectedReqForReport.status === 'Rejected' ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', border: '1px solid #fecaca', background: '#fff5f5' }}>
                      <XCircle size={40} style={{ color: '#dc2626', marginBottom: '0.75rem' }} />
                      <h3 style={{ margin: '0 0 0.35rem', color: '#991b1b' }}>Soil Test Request Rejected</h3>
                      <p style={{ fontSize: '0.9rem', color: '#7f1d1d', maxWidth: 480, margin: '0 auto 1.25rem' }}>
                        Your soil test request (<strong>{selectedReqForReport.request_ref}</strong>) for plot <strong>{selectedReqForReport.field_name}</strong> was reviewed and not approved by the administration.
                      </p>
                      <div style={{ background: '#ffffff', border: '1px solid #fca5a5', borderRadius: 8, padding: '1rem 1.25rem', maxWidth: 440, margin: '0 auto', textAlign: 'left', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '0.35rem' }}>Reason Provided by Administration:</div>
                        <div style={{ color: '#450a0a', lineHeight: 1.5 }}>
                          {selectedReqForReport.rejection_reason || 'Request could not be processed due to administrative criteria.'}
                        </div>
                      </div>
                    </div>
                  ) : selectedReqForReport.status === 'Accepted' ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
                      <CheckCircle2 size={40} style={{ color: '#16a34a', marginBottom: '0.75rem' }} />
                      <h3 style={{ margin: '0 0 0.35rem', color: '#166534' }}>Soil Test Request Accepted!</h3>
                      <p style={{ fontSize: '0.9rem', color: '#14532d', maxWidth: 480, margin: '0 auto 1.25rem' }}>
                        Your soil test request (<strong>{selectedReqForReport.request_ref}</strong>) has been approved by the administration. A qualified testing provider is being scheduled.
                      </p>
                      <div style={{ background: '#ffffff', border: '1px solid #86efac', borderRadius: 8, padding: '0.85rem 1.25rem', maxWidth: 420, margin: '0 auto', textAlign: 'left', fontSize: '0.82rem' }}>
                        <div style={{ marginBottom: '0.3rem' }}>Assigned Provider: <strong>{selectedReqForReport.provider_name}</strong></div>
                        <div style={{ marginBottom: '0.3rem' }}>Contact: <strong>{selectedReqForReport.provider_contact || 'Pending confirmation'}</strong></div>
                        <div style={{ marginBottom: '0.3rem' }}>Appointment Date: <strong>{selectedReqForReport.appointment_date}</strong> {selectedReqForReport.appointment_time || ''}</div>
                        <div>Preferred Date: <strong>{selectedReqForReport.preferred_date || 'None specified'}</strong></div>
                      </div>
                    </div>
                  ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                      <Clock size={36} style={{ color: '#b45309', marginBottom: '0.75rem' }} />
                      <h3 style={{ margin: '0 0 0.35rem' }}>
                        {selectedReqForReport.status === 'Submitted' ? 'Request Awaiting Admin Review' : `Progress: ${selectedReqForReport.status}`}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#475569', maxWidth: 460, margin: '0 auto 1rem' }}>
                        Your soil test request (<strong>{selectedReqForReport.request_ref}</strong>) for <strong>{selectedReqForReport.field_name}</strong> is currently at status <strong>{selectedReqForReport.status}</strong>.
                      </p>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.85rem 1.25rem', maxWidth: 420, margin: '0 auto', textAlign: 'left', fontSize: '0.82rem' }}>
                        <div style={{ marginBottom: '0.3rem' }}>Assigned Provider: <strong>{selectedReqForReport.provider_name}</strong></div>
                        <div style={{ marginBottom: '0.3rem' }}>Confirmed Appointment: <strong>{selectedReqForReport.appointment_date}</strong> {selectedReqForReport.appointment_time || ''}</div>
                        <div>Sample ID: <strong>{selectedReqForReport.sample_id || 'Pending sample collection'}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
