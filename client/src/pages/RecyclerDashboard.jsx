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
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'verify' | 'certificates' | 'reports' | 'license'
  const [incomingBatches, setIncomingBatches] = useState([]);
  const [metrics, setMetrics] = useState({ totalIntakeKg: 28.5, totalPayoutINR: 7702, completedCount: 3, pendingCount: 2 });
  const [certificates, setCertificates] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [handoverOtp, setHandoverOtp] = useState('');
  const [verifiedWeight, setVerifiedWeight] = useState('');
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  // License verification form state
  const [cpcbNumber, setCpcbNumber] = useState(user?.cpcbRegNumber || 'CPCB/EW-REG/MH/2024/9912');
  const [specializations, setSpecializations] = useState(['battery', 'circuit_board']);
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
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Factory size={28} color="#0b0f19" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', color: '#ffffff', margin: 0 }}>{companyName}</h1>
              <span className="badge badge-primary">CPCB APPROVED</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Reg: {cpcbNumber} · Specialized in Lithium, Cobalt & Neodymium Hydrometallurgy
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '4px' }}>
          <button
            onClick={() => setActiveTab('incoming')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: activeTab === 'incoming' ? 'var(--primary)' : 'transparent', color: activeTab === 'incoming' ? '#ffffff' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
          >
            📦 Incoming Lots ({incomingBatches.length})
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: activeTab === 'verify' ? 'var(--primary)' : 'transparent', color: activeTab === 'verify' ? '#ffffff' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
          >
            🔒 Confirm Handover (OTP)
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: activeTab === 'certificates' ? 'var(--primary)' : 'transparent', color: activeTab === 'certificates' ? '#ffffff' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
          >
            📜 EPR Certificates ({certificates.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: activeTab === 'reports' ? 'var(--primary)' : 'transparent', color: activeTab === 'reports' ? '#ffffff' : 'var(--text-muted)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
          >
            📊 AI Fairness & Reports
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total E-Waste Sourced</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', margin: '4px 0' }}>
            {metrics.totalIntakeKg} kg
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>100% verified formal chain</span>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cash Payout to Collectors</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--copper)', margin: '4px 0' }}>
            ₹{metrics.totalPayoutINR}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Zero intermediaries</span>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified EPR Handover Proofs</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#38bdf8', margin: '4px 0' }}>
            {certificates.length}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>SHA-256 Audit Sealed</span>
        </div>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Government Compliance</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', margin: '4px 0' }}>
            100%
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>JNARDDC / CPCB Audited</span>
        </div>
      </div>

      {/* TAB 1: INCOMING BATCHES & MARKETPLACE */}
      {activeTab === 'incoming' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Live Matched Lots in Service Area</h2>
            <button onClick={fetchIncomingBatches} className="btn-tactile btn-glass" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              <RefreshCw size={14} /> Refresh Feed
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {incomingBatches.map((batch) => (
              <div key={batch._id} className="glass-panel" style={{ padding: '18px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>
                      {batch.categoryName || batch.category}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Collector: <strong>{batch.collectorName}</strong> (+91-{batch.collectorPhone})
                    </span>
                  </div>
                  <span className={`badge ${batch.status === 'completed' ? 'badge-primary' : 'badge-copper'}`}>
                    {batch.status}
                  </span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '10px', margin: '10px 0', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Lot Weight:</span>
                    <strong style={{ color: '#ffffff' }}>{batch.weightKg} kg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Metals:</span>
                    <span style={{ color: 'var(--copper)' }}>
                      {batch.estimatedMetals?.lithium_g ? `${batch.estimatedMetals.lithium_g}g Li` : ''}{' '}
                      {batch.estimatedMetals?.copper_g ? `${batch.estimatedMetals.copper_g}g Cu` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Cash Payout:</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '0.95rem' }}>
                      ₹{batch.grandTotal || batch.totalAgreedPrice}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedBatch(batch);
                      setVerifiedWeight(batch.weightKg);
                      setActiveTab('verify');
                    }}
                    className="btn-tactile btn-primary"
                    style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                  >
                    Confirm Handover (OTP)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONFIRM HANDOVER & OTP VERIFICATION */}
      {activeTab === 'verify' && selectedBatch && (
        <div className="animate-fade-in" style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <span className="badge badge-primary" style={{ marginBottom: '6px' }}>PROOF-OF-HANDOVER LOCK</span>
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff' }}>Confirm Lot Receipt & Payout</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Ask collector <strong>{selectedBatch.collectorName}</strong> for the 4-digit OTP shown on their screen.
              </p>
            </div>

            <form onSubmit={handleVerifyHandover}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Batch ID:</span>
                  <strong>{selectedBatch._id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Material:</span>
                  <strong>{selectedBatch.categoryName || selectedBatch.category}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Agreed Cash Payout:</span>
                  <strong style={{ color: 'var(--primary)' }}>₹{selectedBatch.grandTotal || selectedBatch.totalAgreedPrice}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Verified Weight on Certified Recycler Scale (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={verifiedWeight}
                  onChange={(e) => setVerifiedWeight(e.target.value)}
                  style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--border-glass)', borderRadius: '10px', color: '#ffffff', fontSize: '1.1rem', padding: '10px 14px', width: '100%', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Collector 4-Digit Handover OTP (Default: 4892 or 1234)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={handoverOtp}
                  onChange={(e) => setHandoverOtp(e.target.value)}
                  placeholder="e.g. 4892"
                  style={{ background: 'rgba(255, 255, 255, 0.08)', border: '2px solid var(--primary)', borderRadius: '12px', color: '#ffffff', fontSize: '1.6rem', textAlign: 'center', letterSpacing: '0.3em', padding: '12px', width: '100%', outline: 'none' }}
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

      {/* TAB 3: VERIFIABLE EPR CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Issued Extended Producer Responsibility (EPR) Certificates</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Corporate Compliance Ready</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {certificates.map((cert) => (
              <div key={cert._id} className="glass-panel" style={{ padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: '#ffffff' }}>{cert.certificateNumber}</span>
                    <span className="badge badge-primary">VERIFIED ACTIVE</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0' }}>
                    Material: <strong style={{ color: 'var(--copper)' }}>{cert.materialType} ({cert.weightKg} kg)</strong> · Sourced from {cert.collectorName}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                    SHA-256: {cert.hash?.slice(0, 32)}...
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setViewingCertificate(cert)}
                    className="btn-tactile btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    <FileText size={16} /> View & Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SIMPLE REPORTS & AI PRICE FAIRNESS CHECKER */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="var(--copper)" />
              AI Price Fairness & Anti-Exploitation Anomaly Detector
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Our machine learning engine flags predatory prices from informal middlemen to protect collectors and guarantee legitimate market value.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>🚨 Flagged Predatory Offer Detected</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dharavi Cluster</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
                  An informal buyer offered ₹120/kg for Lithium-Ion batteries. JNARDDC fair benchmark is ₹260/kg.
                  <strong> Deal blocked by Scrap Sathi anti-exploitation filter.</strong>
                </p>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>✅ Fair Price Compliance: 98.4%</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 30 Days</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
                  All deals conducted on Scrap Sathi were within ±8% of JNARDDC fair benchmarks. Collectors earned an average of +156% higher income compared to burning/acid scrap dealers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <EPRCertificateModal
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </div>
  );
};
