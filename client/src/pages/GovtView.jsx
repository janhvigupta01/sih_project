import React, { useState, useEffect } from 'react';
import { EPRCertificateModal } from '../components/EPRCertificateModal';
import {
  Landmark,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Search,
  Database,
  Award,
  Globe,
  Coins,
  CheckCircle,
  BarChart3,
  Flame,
  Leaf
} from 'lucide-react';

export const GovtView = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [searchHash, setSearchHash] = useState('');
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [viewingCertificate, setViewingCertificate] = useState(null);

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/govt/telemetry');
      const data = await res.json();
      if (data.success) {
        setTelemetry(data);
      }
    } catch (e) {}
  };

  const handleVerifyHash = async (e) => {
    e.preventDefault();
    if (!searchHash) return;
    setSearchError('');
    setVerifiedResult(null);

    try {
      const res = await fetch(`/api/handover/verify/${searchHash.trim()}`);
      const data = await res.json();
      if (data.success && data.valid) {
        setVerifiedResult(data.certificate);
      } else {
        setSearchError('❌ Hash not found in JNARDDC immutable ledger.');
      }
    } catch (err) {
      setSearchError('Error verifying with central ledger.');
    }
  };

  return (
    <div className="app-container">
      {/* Ministry Header */}
      <div style={{ background: '#162544', borderRadius: '24px', padding: '24px', marginBottom: '22px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', boxShadow: '0 8px 25px rgba(22, 37, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(13, 148, 136, 0.4)' }}>
            <Landmark size={32} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', color: '#ffffff', margin: 0 }}>
                Ministry of Mines (MoM) · JNARDDC
              </h1>
              <span className="badge badge-copper" style={{ background: '#fef3c7', color: '#b45309', border: 'none', fontWeight: '800' }}>
                NATIONAL CRITICAL MINERAL TELEMETRY
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Smart India Hackathon 2026 · Problem Statement 26229: "Kabadiwala Connect"
            </p>
          </div>
        </div>
      </div>

      {/* STRATEGIC MINERAL TOTALS */}
      <h2 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Coins size={22} color="#d97706" />
        National Strategic Mineral Recovery Reserves (From Informal E-Waste):
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', borderLeft: '5px solid #0d9488' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Lithium (Li) Recovered</span>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#0d9488', margin: '4px 0' }}>
            {telemetry?.nationalTotals?.criticalMineralsRecovered?.lithiumKg || 84.5} kg
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Saves import dependence</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', borderLeft: '5px solid #d97706' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Cobalt (Co) Recovered</span>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#d97706', margin: '4px 0' }}>
            {telemetry?.nationalTotals?.criticalMineralsRecovered?.cobaltKg || 320.4} kg
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Diverted from toxic acid wash</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', borderLeft: '5px solid #7c3aed' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Neodymium Rare Earth (Nd)</span>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#7c3aed', margin: '4px 0' }}>
            {telemetry?.nationalTotals?.criticalMineralsRecovered?.neodymiumKg || 112.0} kg
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rare-earth permanent magnets</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', borderLeft: '5px solid #ea580c' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Refined Copper (Cu)</span>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#ea580c', margin: '4px 0' }}>
            {telemetry?.nationalTotals?.criticalMineralsRecovered?.copperKg || 2450.0} kg
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>99.9% pure wire-grade</span>
        </div>
      </div>

      {/* STATE RECOVERY HEATMAP & FORMALIZATION IMPACT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '22px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="#0d9488" />
            State-Wise Critical Mineral Formalization
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {telemetry?.stateHeatmap?.map((item) => (
              <div key={item.state} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{item.state}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {item.collectorsCount} collectors · {item.recyclersCount} approved recyclers
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: '#0d9488', fontSize: '1.05rem' }}>{item.recoveredKg} kg</div>
                  <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: '700' }}>{item.lithiumKg} kg Li · {item.cobaltKg} kg Co</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '22px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#d97706" />
            Economic & Health Value Comparison
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '14px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: '700', fontSize: '0.88rem' }}>
                <Flame size={16} /> Informal Acid/Burning Route (Traditional)
              </div>
              <p style={{ fontSize: '0.82rem', color: '#7f1d1d', marginTop: '4px', lineHeight: '1.45' }}>
                Only recovers coarse copper (~₹115/kg). Lithium, cobalt, and rare earths are destroyed. Releases carcinogenic dioxins and toxic runoff.
              </p>
            </div>

            <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: '700', fontSize: '0.88rem' }}>
                <Leaf size={16} /> Scrap Sathi Formal Hydrometallurgy Route
              </div>
              <p style={{ fontSize: '0.82rem', color: '#065f46', marginTop: '4px', lineHeight: '1.45' }}>
                Full critical mineral extraction (~₹295/kg, <strong>+156% higher income for kabadiwalas</strong>). Certified zero-emission recovery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFIABLE EPR LEDGER */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} color="#0d9488" />
          JNARDDC Central SHA-256 EPR Verification Portal
        </h3>
        <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '16px' }}>
          Enter any Batch ID, Certificate Number, or SHA-256 hash to verify authentic chain of custody.
        </p>

        <form onSubmit={handleVerifyHash} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            type="text"
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            placeholder="e.g. 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
            style={{ flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px 16px', color: '#0f172a', fontSize: '0.92rem', outline: 'none' }}
          />
          <button type="submit" className="btn-tactile btn-primary" style={{ padding: '12px 22px' }}>
            <Search size={16} /> Verify Hash
          </button>
        </form>

        {searchError && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '10px', justifyContent: 'center' }}>
            {searchError}
          </div>
        )}

        {verifiedResult && (
          <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color="#047857" />
                <strong style={{ color: '#065f46' }}>Authentic EPR Record Verified by Ministry of Mines</strong>
              </div>
              <button onClick={() => setViewingCertificate(verifiedResult)} className="btn-tactile btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                View Certificate
              </button>
            </div>
          </div>
        )}
      </div>

      {viewingCertificate && (
        <EPRCertificateModal certificate={viewingCertificate} onClose={() => setViewingCertificate(null)} />
      )}
    </div>
  );
};
