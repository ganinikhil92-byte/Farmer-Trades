import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import {
  FlaskConical,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Download,
  Filter,
  Search,
  Building2,
  ShieldCheck,
  Check,
  XCircle,
  X
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

const PARAMETER_KEYS = [
  { key: 'n', label: 'Nitrogen (N)', unit: 'kg/ha' },
  { key: 'p', label: 'Phosphorus (P)', unit: 'kg/ha' },
  { key: 'k', label: 'Potassium (K)', unit: 'kg/ha' },
  { key: 'ph', label: 'Soil Reaction (pH)', unit: 'pH' },
  { key: 'ec', label: 'Electrical Conductivity (EC)', unit: 'dS/m' },
  { key: 'oc', label: 'Organic Carbon (OC)', unit: '%' },
  { key: 's', label: 'Sulphur (S)', unit: 'ppm' },
  { key: 'zn', label: 'Zinc (Zn)', unit: 'ppm' },
  { key: 'fe', label: 'Iron (Fe)', unit: 'ppm' },
  { key: 'cu', label: 'Copper (Cu)', unit: 'ppm' },
  { key: 'mn', label: 'Manganese (Mn)', unit: 'ppm' },
  { key: 'b', label: 'Boron (B)', unit: 'ppm' },
];

export default function SoilTestAdmin() {
  const [requests, setRequests] = useState<SoilTestRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedReq, setSelectedReq] = useState<SoilTestRequestItem | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Accept & Reject state
  const [acceptProvider, setAcceptProvider] = useState('Karnataka Regional Soil Testing Lab');
  const [acceptContact, setAcceptContact] = useState('+91 80 2221 0000');
  const [acceptDate, setAcceptDate] = useState('');
  const [acceptTime, setAcceptTime] = useState('10:00 AM');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Status form state
  const [newStatus, setNewStatus] = useState<string>('Submitted');
  const [providerName, setProviderName] = useState('');
  const [providerContact, setProviderContact] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [sampleId, setSampleId] = useState('');
  const [sampleCollectedDate, setSampleCollectedDate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Report form state
  const [labName, setLabName] = useState('');
  const [reportRef, setReportRef] = useState('');
  const [labSampleId, setLabSampleId] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [testedDate, setTestedDate] = useState('');
  const [labRecommendations, setLabRecommendations] = useState('');
  const [reviewerName, setReviewerName] = useState('Authorized Lab Reviewer');
  const [paramInputs, setParamInputs] = useState<Record<string, { value: string; unit: string; rating: string }>>({});
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [savingReport, setSavingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    fetchRequests();
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

  function saveLocalRequests(items: SoilTestRequestItem[]) {
    try {
      localStorage.setItem('agro_soil_test_requests', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving local requests', e);
    }
  }

  function fetchRequests() {
    setLoading(true);
    const local = getLocalRequests();
    api.get('/soil-test-requests')
      .then((res) => {
        const remoteData = (res.data || []) as SoilTestRequestItem[];
        const remoteIds = new Set(remoteData.map((r) => r.id));
        const remoteRefs = new Set(remoteData.map((r) => r.request_ref));
        const merged = [...remoteData, ...local.filter((l) => !remoteIds.has(l.id) && !remoteRefs.has(l.request_ref))];
        setRequests(merged);
      })
      .catch((err) => {
        console.error('Failed to fetch requests from API, showing local store', err);
        setRequests(local);
      })
      .finally(() => setLoading(false));
  }

  function openAcceptModal(req: SoilTestRequestItem) {
    setSelectedReq(req);
    const defaultProv = req.provider_name && req.provider_name !== 'Not assigned' && req.provider_name !== 'Pending Admin Assignment' ? req.provider_name : 'Karnataka Regional Soil Testing Lab';
    setAcceptProvider(defaultProv);
    setAcceptContact(req.provider_contact && req.provider_contact !== 'Not assigned' ? req.provider_contact : '+91 80 2221 0000');
    setAcceptDate(req.preferred_date || '');
    setAcceptTime(req.appointment_time || '10:00 AM');
    setShowAcceptModal(true);
  }

  function openRejectModal(req: SoilTestRequestItem) {
    setSelectedReq(req);
    setRejectReason(req.rejection_reason || '');
    setShowRejectModal(true);
  }

  async function handleConfirmAccept(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!selectedReq) return;
    setActionLoading(true);

    try {
      try {
        await api.post(`/admin/soil-test-requests/${selectedReq.id}/accept`, {
          provider_name: acceptProvider,
          provider_contact: acceptContact,
          appointment_date: acceptDate,
          appointment_time: acceptTime,
        });
      } catch (apiErr) {
        // Fallback: try PUT
        try {
          await api.put(`/admin/soil-test-requests/${selectedReq.id}`, {
            status: acceptDate ? 'Scheduled' : 'Accepted',
            provider_name: acceptProvider,
            provider_contact: acceptContact,
            appointment_date: acceptDate,
            appointment_time: acceptTime,
          });
        } catch {
          // Offline update
        }
      }

      const updatedStatus = acceptDate ? 'Scheduled' : 'Accepted';
      const updatedReq: SoilTestRequestItem = {
        ...selectedReq,
        status: updatedStatus as any,
        provider_name: acceptProvider,
        provider_contact: acceptContact,
        appointment_date: acceptDate || 'Confirmed by Admin',
        appointment_time: acceptTime,
        review_status: 'Accepted by Admin',
      };

      setRequests((prev) => prev.map((r) => (r.id === selectedReq.id ? updatedReq : r)));
      const local = getLocalRequests();
      const updatedLocal = local.map((r) => (r.id === selectedReq.id || r.request_ref === selectedReq.request_ref ? updatedReq : r));
      saveLocalRequests(updatedLocal);

      setShowAcceptModal(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to accept request.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmReject(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!selectedReq) return;
    setActionLoading(true);

    const reason = rejectReason.trim() || 'Request could not be approved by administration at this time.';

    try {
      try {
        await api.post(`/admin/soil-test-requests/${selectedReq.id}/reject`, {
          rejection_reason: reason,
        });
      } catch (apiErr) {
        try {
          await api.put(`/admin/soil-test-requests/${selectedReq.id}`, {
            status: 'Rejected',
            rejection_reason: reason,
          });
        } catch {
          // Local fallback
        }
      }

      const updatedReq: SoilTestRequestItem = {
        ...selectedReq,
        status: 'Rejected',
        rejection_reason: reason,
        review_status: `Rejected: ${reason}`,
      };

      setRequests((prev) => prev.map((r) => (r.id === selectedReq.id ? updatedReq : r)));
      const local = getLocalRequests();
      const updatedLocal = local.map((r) => (r.id === selectedReq.id || r.request_ref === selectedReq.request_ref ? updatedReq : r));
      saveLocalRequests(updatedLocal);

      setShowRejectModal(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  }

  function openStatusModal(req: SoilTestRequestItem) {
    setSelectedReq(req);
    setNewStatus(req.status);
    setProviderName(req.provider_name === 'Not assigned' ? '' : req.provider_name);
    setProviderContact(req.provider_contact === 'Not assigned' ? '' : req.provider_contact);
    setAppointmentDate(req.appointment_date === 'Not confirmed' ? '' : req.appointment_date);
    setAppointmentTime(req.appointment_time || '');
    setSampleId(req.sample_id || '');
    setSampleCollectedDate(req.sample_collected_date || '');
    setRejectionReason(req.rejection_reason || '');
    setReviewStatus(req.review_status || '');
    setShowStatusModal(true);
  }

  async function handleSaveStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReq) return;
    setSavingStatus(true);
    try {
      await api.put(`/admin/soil-test-requests/${selectedReq.id}`, {
        status: newStatus,
        provider_name: providerName,
        provider_contact: providerContact,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        sample_id: sampleId,
        sample_collected_date: sampleCollectedDate,
        rejection_reason: rejectionReason,
        review_status: reviewStatus,
      });
      setShowStatusModal(false);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update request progress.');
    } finally {
      setSavingStatus(false);
    }
  }

  function openReportModal(req: SoilTestRequestItem) {
    setSelectedReq(req);
    setLabName(req.provider_name !== 'Not assigned' ? req.provider_name : '');
    setReportRef(req.report?.report_reference || `REP-${req.id.toString().padStart(4, '0')}`);
    setLabSampleId(req.sample_id || req.report?.sample_id || `SMP-${req.id.toString().padStart(4, '0')}`);
    setCollectionDate(req.sample_collected_date || req.report?.collection_date || '');
    setTestedDate(req.report?.tested_date || new Date().toISOString().split('T')[0]);
    setLabRecommendations(req.report?.laboratory_recommendations || '');
    setReviewerName(req.report?.reviewer_name || 'Authorized Lab Reviewer');
    setReportFile(null);
    setReportError('');

    // Pre-populate parameter inputs from existing report if available
    const initialParams: Record<string, { value: string; unit: string; rating: string }> = {};
    PARAMETER_KEYS.forEach(({ key, unit }) => {
      const existing = req.report?.parameters_12?.[key];
      initialParams[key] = {
        value: existing?.value !== undefined && existing?.value !== null ? String(existing.value) : '',
        unit: existing?.unit || unit,
        rating: existing?.rating || '',
      };
    });
    setParamInputs(initialParams);
    setShowReportModal(true);
  }

  async function handleSaveReport(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReq) return;
    setReportError('');

    if (!labName.trim()) {
      setReportError('Laboratory or qualified testing provider name is required.');
      return;
    }

    // Validate pH is between 0 and 14 if provided
    const phVal = paramInputs['ph']?.value;
    if (phVal && phVal.trim() !== '') {
      const parsedPh = parseFloat(phVal);
      if (isNaN(parsedPh) || parsedPh < 0 || parsedPh > 14) {
        setReportError('pH value must be a valid number between 0 and 14.');
        return;
      }
    }

    // Validate other numeric inputs are non-negative
    for (const { key, label } of PARAMETER_KEYS) {
      if (key === 'ph') continue;
      const val = paramInputs[key]?.value;
      if (val && val.trim() !== '') {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0) {
          setReportError(`Measurement for ${label} must be a valid non-negative number.`);
          return;
        }
      }
    }

    if (reportFile && reportFile.size > 5 * 1024 * 1024) {
      setReportError('Report attachment exceeds the 5 MB limit.');
      return;
    }

    setSavingReport(true);

    try {
      const formData = new FormData();
      formData.append('laboratory_name', labName.trim());
      formData.append('report_reference', reportRef.trim());
      formData.append('sample_id', labSampleId.trim());
      formData.append('collection_date', collectionDate);
      formData.append('tested_date', testedDate);
      formData.append('laboratory_recommendations', labRecommendations.trim());
      formData.append('reviewer_name', reviewerName.trim());

      // Serialize parameters with units and ratings
      const serializedParams: Record<string, any> = {};
      for (const { key } of PARAMETER_KEYS) {
        const entry = paramInputs[key];
        const v = entry?.value?.trim();
        serializedParams[key] = {
          value: v !== '' && v !== undefined ? parseFloat(v) : null,
          unit: entry?.unit || '',
          rating: entry?.rating?.trim() || '',
        };
      }
      formData.append('parameters_json', JSON.stringify(serializedParams));

      if (reportFile) {
        formData.append('file', reportFile);
      }

      await api.post(`/admin/soil-test-requests/${selectedReq.id}/report`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowReportModal(false);
      fetchRequests();
    } catch (err: any) {
      setReportError(err.response?.data?.detail || 'Failed to save laboratory report.');
    } finally {
      setSavingReport(false);
    }
  }

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
      alert('Unable to download attachment.');
    }
  }

  // Filter requests
  const filtered = requests.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (districtFilter !== 'All' && r.district !== districtFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.farmer_name.toLowerCase().includes(q) ||
        r.request_ref.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.field_name.toLowerCase().includes(q) ||
        r.village.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate KPIs
  const totalCount = requests.length;
  const submittedCount = requests.filter((r) => r.status === 'Submitted').length;
  const acceptedCount = requests.filter((r) => r.status === 'Accepted').length;
  const scheduledCount = requests.filter((r) => r.status === 'Scheduled').length;
  const inProgressCount = requests.filter((r) => r.status === 'Testing in Progress' || r.status === 'Sample Collected').length;
  const availableCount = requests.filter((r) => r.status === 'Report Available').length;
  const rejectedCount = requests.filter((r) => r.status === 'Rejected').length;
  const pendingFarmerUploads = requests.filter((r) => r.is_farmer_upload && r.review_status?.includes('pending')).length;

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            <ShieldCheck size={14} /> Karnataka Agricultural Laboratory Administration
          </div>
          <h1>Soil Testing & Reports Management</h1>
          <p>Review farmer requests, accept or reject submissions, assign testing laboratories, and publish certified reports.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-cards stagger" style={{ marginBottom: '1.75rem' }}>
        <div className="card stat-card">
          <div className="stat-card-icon blue"><FlaskConical size={24} /></div>
          <div className="stat-card-info">
            <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{totalCount}</h3>
            <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>Total Requests</p>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Registered field requests</span>
          </div>
        </div>

        <div className="card stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-card-icon amber"><Clock size={24} /></div>
          <div className="stat-card-info">
            <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{submittedCount}</h3>
            <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>Pending Review</p>
            <span style={{ fontSize: '0.78rem', color: '#b45309' }}>Requires Accept / Reject</span>
          </div>
        </div>

        <div className="card stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div className="stat-card-icon green"><Check size={24} /></div>
          <div className="stat-card-info">
            <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{acceptedCount}</h3>
            <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>Accepted</p>
            <span style={{ fontSize: '0.78rem', color: '#16a34a' }}>Approved requests</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-icon green"><Calendar size={24} /></div>
          <div className="stat-card-info">
            <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{scheduledCount}</h3>
            <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>Appointments Confirmed</p>
            <span style={{ fontSize: '0.78rem', color: '#16a34a' }}>Scheduled visits</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-card-icon green"><CheckCircle2 size={24} /></div>
          <div className="stat-card-info">
            <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{availableCount}</h3>
            <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>Reports Available</p>
            <span style={{ fontSize: '0.78rem', color: '#059669' }}>Certified & released</span>
          </div>
        </div>

        {rejectedCount > 0 && (
          <div className="card stat-card" style={{ borderColor: '#fecaca', background: '#fff5f5' }}>
            <div className="stat-card-icon red" style={{ color: '#dc2626' }}><X size={24} /></div>
            <div className="stat-card-info">
              <h3 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700, color: '#dc2626' }}>{rejectedCount}</h3>
              <p style={{ margin: '0.2rem 0', fontWeight: 600 }}>Rejected</p>
              <span style={{ fontSize: '0.78rem', color: '#991b1b' }}>Declined requests</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
            <input
              className="input"
              style={{ paddingLeft: '2.2rem' }}
              placeholder="Search by ref, farmer name, phone, or plot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
            <select
              className="input"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Pending Review (Submitted)</option>
              <option value="Accepted">Accepted</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Sample Collected">Sample Collected</option>
              <option value="Testing in Progress">Testing in Progress</option>
              <option value="Report Available">Report Available</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>District:</span>
            <select
              className="input"
              style={{ width: 'auto' }}
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
            >
              <option value="All">All Districts</option>
              {karnatakaDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="animate-pulse">Loading soil test requests...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <FlaskConical size={42} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
          <h3>No matching soil test requests</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Farmer & Contact</th>
                <th>Field & Area</th>
                <th>Status</th>
                <th>Testing Provider</th>
                <th>Confirmed Appointment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f766e' }}>{r.request_ref}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.created_at}</div>
                    {r.is_farmer_upload && (
                      <span className="badge badge-amber" style={{ fontSize: '0.68rem', marginTop: '0.2rem', display: 'inline-block' }}>
                        Farmer Upload
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.farmer_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>📞 {r.phone}</div>
                    {r.farmer_id && <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{r.farmer_id}</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.field_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {r.village}, {r.taluk}, {r.district}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>
                      {r.land_acres} {r.land_unit}
                    </div>
                  </td>
                  <td>
                    {r.status === 'Submitted' && <span className="badge badge-blue">Submitted (Pending)</span>}
                    {r.status === 'Accepted' && <span className="badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>✓ Accepted</span>}
                    {r.status === 'Rejected' && (
                      <div>
                        <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>✕ Rejected</span>
                        {r.rejection_reason && (
                          <div style={{ fontSize: '0.72rem', color: '#991b1b', marginTop: '0.2rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.rejection_reason}>
                            {r.rejection_reason}
                          </div>
                        )}
                      </div>
                    )}
                    {r.status === 'Scheduled' && <span className="badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>Scheduled</span>}
                    {r.status === 'Sample Collected' && <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>Sample Collected</span>}
                    {r.status === 'Testing in Progress' && <span className="badge" style={{ background: '#cffafe', color: '#0e7490' }}>Testing in Progress</span>}
                    {r.status === 'Report Available' && <span className="badge badge-green">Report Available</span>}
                    {r.status === 'Cancelled' && <span className="badge badge-red">Cancelled</span>}
                    {r.review_status && r.status !== 'Rejected' && (
                      <div style={{ fontSize: '0.72rem', color: '#854d0e', marginTop: '0.2rem' }}>
                        {r.review_status}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: r.provider_name === 'Not assigned' || r.provider_name === 'Pending Admin Assignment' ? '#94a3b8' : '#1e293b' }}>
                      {r.provider_name}
                    </div>
                    {r.provider_contact && r.provider_contact !== 'Not assigned' && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{r.provider_contact}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: r.appointment_date === 'Not confirmed' || r.appointment_date === 'Pending confirmation' ? '#94a3b8' : '#0f766e' }}>
                      {r.appointment_date}
                    </div>
                    {r.appointment_time && (
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>{r.appointment_time}</div>
                    )}
                    {r.preferred_date && (r.appointment_date === 'Not confirmed' || r.appointment_date === 'Pending confirmation') && (
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Pref: {r.preferred_date}</div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {r.status === 'Submitted' && (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#16a34a', color: '#ffffff', fontSize: '0.75rem', padding: '0.25rem 0.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                            onClick={() => openAcceptModal(r)}
                            title="Accept this soil test request"
                          >
                            <Check size={13} /> Accept
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#dc2626', color: '#ffffff', fontSize: '0.75rem', padding: '0.25rem 0.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                            onClick={() => openRejectModal(r)}
                            title="Reject this soil test request"
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      )}
                      {r.status === 'Accepted' && (
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}
                            onClick={() => openReportModal(r)}
                          >
                            Enter Lab Report
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontSize: '0.72rem', padding: '0.25rem 0.4rem' }}
                            onClick={() => openRejectModal(r)}
                            title="Reject"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      {r.status === 'Rejected' && (
                        <button
                          className="btn btn-sm"
                          style={{ background: '#16a34a', color: '#ffffff', fontSize: '0.72rem', padding: '0.25rem 0.45rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => openAcceptModal(r)}
                        >
                          <Check size={12} /> Re-evaluate & Accept
                        </button>
                      )}
                      {r.status !== 'Submitted' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}
                          onClick={() => openStatusModal(r)}
                        >
                          Update Progress
                        </button>
                      )}
                      {(r.status === 'Testing in Progress' || r.status === 'Sample Collected' || r.status === 'Report Available' || r.status === 'Scheduled') && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}
                          onClick={() => openReportModal(r)}
                        >
                          {r.report ? 'Edit Lab Report' : 'Enter Lab Report'}
                        </button>
                      )}
                      {r.has_attachment && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          onClick={() => handleDownloadAttachment(r.id, r.attachment_filename)}
                        >
                          <Download size={12} /> Attachment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Accept Request */}
      {showAcceptModal && selectedReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-fadeIn" style={{ maxWidth: 520, width: '100%', padding: '1.75rem', border: '2px solid #86efac' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                  <Check size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#166534' }}>Accept Soil Test Request</h3>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    Ref: <strong>{selectedReq.request_ref}</strong> • Farmer: <strong>{selectedReq.farmer_name}</strong>
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAcceptModal(false)}><X size={16} /></button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
              <div>📍 <strong>Field:</strong> {selectedReq.field_name} ({selectedReq.village}, {selectedReq.taluk}, {selectedReq.district})</div>
              <div>📐 <strong>Area:</strong> {selectedReq.land_acres} {selectedReq.land_unit} • 📞 <strong>Phone:</strong> {selectedReq.phone}</div>
              {selectedReq.preferred_date && <div>🗓 <strong>Farmer Preferred Date:</strong> {selectedReq.preferred_date}</div>}
            </div>

            <form onSubmit={handleConfirmAccept}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Assign Soil Testing Laboratory / Provider <span style={{ color: '#dc2626' }}>*</span></label>
                <input
                  className="input"
                  value={acceptProvider}
                  onChange={(e) => setAcceptProvider(e.target.value)}
                  placeholder="e.g. Karnataka Regional Soil Analytical Lab"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Provider Contact Info</label>
                <input
                  className="input"
                  value={acceptContact}
                  onChange={(e) => setAcceptContact(e.target.value)}
                  placeholder="e.g. +91 80 2221 0000"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Confirmed Appointment Date</label>
                  <input
                    className="input"
                    type="date"
                    value={acceptDate}
                    onChange={(e) => setAcceptDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Appointment Time</label>
                  <input
                    className="input"
                    type="text"
                    value={acceptTime}
                    onChange={(e) => setAcceptTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAcceptModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm"
                  style={{ background: '#16a34a', color: '#ffffff', padding: '0.6rem 1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  disabled={actionLoading}
                >
                  <Check size={16} /> {actionLoading ? 'Accepting...' : 'Confirm & Accept Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reject Request */}
      {showRejectModal && selectedReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-fadeIn" style={{ maxWidth: 500, width: '100%', padding: '1.75rem', border: '2px solid #fca5a5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                  <X size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#991b1b' }}>Reject Soil Test Request</h3>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    Ref: <strong>{selectedReq.request_ref}</strong> • Farmer: <strong>{selectedReq.farmer_name}</strong>
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowRejectModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleConfirmReject}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Select Common Reason or Enter Details <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  {[
                    'Plot outside serviceable jurisdiction',
                    'Invalid or unreachable contact number',
                    'Incomplete plot or land details',
                    'Duplicate request already submitted',
                    'Testing lab capacity full for selected date',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setRejectReason(chip)}
                      style={{
                        fontSize: '0.74rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 4,
                        border: rejectReason === chip ? '1px solid #dc2626' : '1px solid #e2e8f0',
                        background: rejectReason === chip ? '#fee2e2' : '#f8fafc',
                        color: rejectReason === chip ? '#991b1b' : '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <textarea
                  className="input"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this request is being rejected (visible to the farmer)..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm"
                  style={{ background: '#dc2626', color: '#ffffff', padding: '0.6rem 1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  disabled={actionLoading}
                >
                  <X size={16} /> {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: Update Progress, Testing Provider & Appointment */}
      {showStatusModal && selectedReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-fadeIn" style={{ maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Update Progress: {selectedReq.request_ref}</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Farmer: {selectedReq.farmer_name} • Plot: {selectedReq.field_name}
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowStatusModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveStatus}>
              {/* Status */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Workflow Status <span style={{ color: '#dc2626' }}>*</span></label>
                <select
                  className="input"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="Submitted">Submitted (Request Received)</option>
                  <option value="Accepted">Accepted (Approved by Admin)</option>
                  <option value="Scheduled">Scheduled (Appointment Confirmed)</option>
                  <option value="Sample Collected">Sample Collected</option>
                  <option value="Testing in Progress">Testing in Progress</option>
                  <option value="Report Available">Report Available</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Provider Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Testing Provider / Lab Name</label>
                  <input
                    className="input"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="e.g. Mysuru Regional Soil Analytical Lab"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Provider Contact Info</label>
                  <input
                    className="input"
                    value={providerContact}
                    onChange={(e) => setProviderContact(e.target.value)}
                    placeholder="e.g. +91 821 2419800"
                  />
                </div>
              </div>

              {/* Confirmed Appointment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Confirmed Appointment Date</label>
                  <input
                    className="input"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                  {selectedReq.preferred_date && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Farmer preferred: {selectedReq.preferred_date}
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmed Time</label>
                  <input
                    className="input"
                    type="text"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                  />
                </div>
              </div>

              {/* Sample Collection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Sample ID / Identifier</label>
                  <input
                    className="input"
                    value={sampleId}
                    onChange={(e) => setSampleId(e.target.value)}
                    placeholder="e.g. SMP-VIJ-042"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sample Collection Date</label>
                  <input
                    className="input"
                    type="date"
                    value={sampleCollectedDate}
                    onChange={(e) => setSampleCollectedDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Review status for farmer uploads */}
              {selectedReq.is_farmer_upload && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Review Status for Farmer Upload</label>
                  <select
                    className="input"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                  >
                    <option value="Uploaded by farmer — pending review">Uploaded by farmer — pending review</option>
                    <option value="reviewed">Reviewed & Verified by Admin</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}

              {/* Cancellation Reason */}
              {newStatus === 'Cancelled' && (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Cancellation Reason</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for cancelling this soil test request..."
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingStatus}>
                  {savingStatus ? 'Saving...' : 'Save Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Enter Certified Lab Measurements & Upload Report */}
      {showReportModal && selectedReq && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card animate-fadeIn" style={{ maxWidth: 740, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Laboratory Report: {selectedReq.request_ref}</h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Farmer: {selectedReq.farmer_name} • Plot: {selectedReq.field_name} ({selectedReq.land_acres} {selectedReq.land_unit})
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowReportModal(false)}><X size={16} /></button>
            </div>

            {reportError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                {reportError}
              </div>
            )}

            <form onSubmit={handleSaveReport}>
              {/* Header Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Laboratory / Testing Provider <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    className="input"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    placeholder="e.g. Krishi Vigyan Kendra Soil Testing Lab"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Report Reference No.</label>
                  <input
                    className="input"
                    value={reportRef}
                    onChange={(e) => setReportRef(e.target.value)}
                    placeholder="e.g. KVK-REP-2026"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sample ID</label>
                  <input
                    className="input"
                    value={labSampleId}
                    onChange={(e) => setLabSampleId(e.target.value)}
                    placeholder="e.g. SMP-0042"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Collection Date</label>
                  <input
                    className="input"
                    type="date"
                    value={collectionDate}
                    onChange={(e) => setCollectionDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Test Conducted Date</label>
                  <input
                    className="input"
                    type="date"
                    value={testedDate}
                    onChange={(e) => setTestedDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reviewer / Agronomist Name</label>
                  <input
                    className="input"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                  />
                </div>
              </div>

              {/* 12 Measured Parameters */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem' }}>
                  Measured Laboratory Parameters (Enter values from testing report; leave unmeasured parameters blank)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {PARAMETER_KEYS.map(({ key, label, unit }) => (
                    <div key={key} style={{ background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#334155', marginBottom: '0.35rem' }}>
                        {label}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <input
                          className="input"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                          type="number"
                          step="any"
                          placeholder="Not provided"
                          value={paramInputs[key]?.value || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setParamInputs((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], value: val },
                            }));
                          }}
                        />
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', minWidth: '42px' }}>{unit}</span>
                      </div>
                      <div style={{ marginTop: '0.35rem' }}>
                        <input
                          className="input"
                          style={{ padding: '0.25rem 0.45rem', fontSize: '0.75rem' }}
                          placeholder="Lab rating (e.g. Optimal / High)"
                          value={paramInputs[key]?.rating || ''}
                          onChange={(e) => {
                            const rat = e.target.value;
                            setParamInputs((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], rating: rat },
                            }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Laboratory Recommendations & Interpretation</label>
                <textarea
                  className="input"
                  rows={2}
                  value={labRecommendations}
                  onChange={(e) => setLabRecommendations(e.target.value)}
                  placeholder="Enter certified advisory notes, nutrient replenishment guidelines, or soil amendments..."
                />
              </div>

              {/* File Attachment */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  Original Report Attachment (PDF, JPG, PNG — Maximum 5 MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="input"
                  onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                />
                {selectedReq.attachment_filename && (
                  <span style={{ fontSize: '0.78rem', color: '#0f766e', marginTop: '0.25rem', display: 'block' }}>
                    Currently attached: {selectedReq.attachment_filename}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={savingReport}>
                  {savingReport ? 'Releasing Report...' : 'Publish & Release Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
