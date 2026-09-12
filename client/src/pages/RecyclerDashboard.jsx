import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { EPRCertificateModal } from '../components/EPRCertificateModal';
import confetti from 'canvas-confetti';
import {
  Factory,
  CheckCircle,
  Clock,
  ShieldCheck,
  FileText,
  AlertTriangle,
  QrCode,
  MapPin,
  TrendingUp,
  Download,
  Search,
  Filter,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const RecyclerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming');
  const [incomingBatches, setIncomingBatches] = useState([]);
  const [metrics, setMetrics] = useState({ totalIntakeKg: 28.5, totalPayoutINR: 7702, completedCount: 3, pendingCount: 2 });
  const [certificates, setCertificates] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [handoverOtp, setHandoverOtp] = useState('');
  const [verifiedWeight, setVerifiedWeight] = useState('');
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  const [cpcbNumber, setCpcbNumber] = useState(user?.cpcbRegNumber || 'CPCB/EW-REG/MH/2024/9912');
  const [companyName, setCompanyName] = useState(user?.companyName || 'EcoMetals Green Refining Pvt Ltd');

  useEffect(() => {
    fetchIncomingBatches();
    fetchCertificates();
  }, []);

  const fetchIncomingBatches = async () => {
    try {
      const res = await fetch('/api/recyclers/incoming', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('scrapsathi_token') || ''}` }
      });
      const data = await res.json();
      if (data.success) {
        setIncomingBatches(data.batches);
        if (data.metrics) setMetrics(data.metrics);
        if (data.batches.length > 0 && !selectedBatch) {
          setSelectedBatch(data.batches[0]);
          setVerifiedWeight(data.batches[0].weightKg);
        }
      }
    } catch (e) {}
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/handover/certificates');
      const data = await res.json();
      if (data.success) setCertificates(data.certificates);
    } catch (e) {}
  };

  const handleVerifyHandover = async (e) => {
    e.preventDefault();
    if (!selectedBatch || !handoverOtp) {
      alert('Please enter the 4-digit OTP provided by the collector.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/handover/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('scrapsathi_token') || ''}`
        },
        body: JSON.stringify({
          batchId: selectedBatch._id,
          otp: handoverOtp,
          verifiedWeightKg: verifiedWeight || selectedBatch.weightKg,
          location: { lat: 19.076, lng: 72.8777, address: 'MIDC Recycler Processing Facility' }
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        setViewingCertificate(data.certificate);
        setHandoverOtp('');
        fetchIncomingBatches();
        fetchCertificates();
        alert('✅ Handover cryptographically verified! Tamper-proof EPR Certificate minted.');
      } else {
        alert(data.message || 'OTP verification failed');
      }
    } catch (e) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Royal Navy Banner */}
      <div style={{ background: '#162544', borderRadius: '24px', padding: '24px', marginBottom: '20px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', boxShadow: '0 8px 25px rgba(22, 37, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Factory size={30} color="#0f172a" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>{companyName}</h1>
              <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none', fontWeight: '800' }}>CPCB APPROVED</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Reg: {cpcbNumber} · Specialized in Lithium, Cobalt & Neodymium Hydrometallurgy
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '4px', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('incoming')}
            style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: activeTab === 'incoming' ? '#0d9488' : 'transparent', color: '#ffffff', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
          >
            📦 Incoming Lots ({incomingBatches.length})
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: activeTab === 'verify' ? '#0d9488' : 'transparent', color: '#ffffff', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
          >
            🔒 Confirm OTP
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: activeTab === 'certificates' ? '#0d9488' : 'transparent', color: '#ffffff', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
          >
            📜 EPR Certificates ({certificates.length})
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '18px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Total E-Waste Sourced</span>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0d9488', margin: '4px 0' }}>
            {metrics.totalIntakeKg} kg
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>100% verified formal chain</span>
        </div>
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '18px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Cash Payout to Collectors</span>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', margin: '4px 0' }}>
            ₹{metrics.totalPayoutINR}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Zero intermediaries</span>
        </div>
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '18px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Verified EPR Proofs</span>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0284c7', margin: '4px 0' }}>
            {certificates.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>SHA-256 Audit Sealed</span>
        </div>
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '18px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Government Audit</span>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669', margin: '4px 0' }}>
            100%
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>JNARDDC / CPCB Approved</span>
        </div>
      </div>

      {/* TAB 1: INCOMING BATCHES & MARKETPLACE */}
      {activeTab === 'incoming' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a' }}>Live Matched Lots in Service Area</h2>
            <button onClick={fetchIncomingBatches} className="btn-tactile btn-glass" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              <RefreshCw size={14} /> Refresh Feed
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {incomingBatches.map((batch) => (
              <div key={batch._id} className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 2px 0' }}>
                      {batch.categoryName || batch.category}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Collector: <strong>{batch.collectorName}</strong> (+91-{batch.collectorPhone})
                    </span>
                  </div>
                  <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none', fontWeight: '800' }}>
                    {batch.status}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', margin: '12px 0', fontSize: '0.84rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Lot Weight:</span>
                    <strong style={{ color: '#0f172a' }}>{batch.weightKg} kg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Estimated Metals:</span>
                    <span style={{ color: '#d97706', fontWeight: '700' }}>
                      {batch.estimatedMetals?.lithium_g ? `${batch.estimatedMetals.lithium_g}g Li` : ''}{' '}
                      {batch.estimatedMetals?.copper_g ? `${batch.estimatedMetals.copper_g}g Cu` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Total Cash Payout:</span>
                    <strong style={{ color: '#0d9488', fontSize: '1rem' }}>
                      ₹{batch.grandTotal || batch.totalAgreedPrice}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedBatch(batch);
                    setVerifiedWeight(batch.weightKg);
                    setActiveTab('verify');
                  }}
                  className="btn-tactile btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
                >
                  Confirm Handover (OTP)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: VERIFY HANDOVER */}
      {activeTab === 'verify' && selectedBatch && (
        <div className="animate-fade-in" style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none', marginBottom: '6px' }}>PROOF-OF-HANDOVER</span>
              <h2 style={{ fontSize: '1.45rem', color: '#0f172a' }}>Confirm Lot Receipt & Payout</h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                Ask collector <strong>{selectedBatch.collectorName}</strong> for the 4-digit OTP shown on their screen.
              </p>
            </div>

            <form onSubmit={handleVerifyHandover}>
              <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', marginBottom: '18px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Batch ID:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedBatch._id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Material:</span>
                  <strong style={{ color: '#0f172a' }}>{selectedBatch.categoryName || selectedBatch.category}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Agreed Cash Payout:</span>
                  <strong style={{ color: '#0d9488' }}>₹{selectedBatch.grandTotal || selectedBatch.totalAgreedPrice}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  Verified Weight on Certified Recycler Scale (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={verifiedWeight}
                  onChange={(e) => setVerifiedWeight(e.target.value)}
                  style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '1.1rem', padding: '12px 16px', width: '100%', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  Collector 4-Digit Handover OTP (Default: 4892 or 1234)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={handoverOtp}
                  onChange={(e) => setHandoverOtp(e.target.value)}
                  placeholder="e.g. 4892"
                  style={{ background: '#f8fafc', border: '2px solid #0d9488', borderRadius: '14px', color: '#0f172a', fontSize: '1.8rem', textAlign: 'center', letterSpacing: '0.3em', padding: '12px', width: '100%', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-tactile btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}
              >
                <CheckCircle size={20} />
                <span>{loading ? 'Locking Cryptographic Proof...' : 'Lock Handover & Mint EPR Certificate'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a' }}>Issued Extended Producer Responsibility (EPR) Certificates</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {certificates.map((cert) => (
              <div key={cert._id} className="glass-panel" style={{ padding: '20px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem' }}>{cert.certificateNumber}</span>
                    <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none' }}>VERIFIED ACTIVE</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0' }}>
                    Material: <strong style={{ color: '#d97706' }}>{cert.materialType} ({cert.weightKg} kg)</strong> · Sourced from {cert.collectorName}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    SHA-256: {cert.hash?.slice(0, 32)}...
                  </p>
                </div>

                <button
                  onClick={() => setViewingCertificate(cert)}
                  className="btn-tactile btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  <FileText size={16} /> View & Download Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewingCertificate && (
        <EPRCertificateModal certificate={viewingCertificate} onClose={() => setViewingCertificate(null)} />
      )}
    </div>
  );
};
