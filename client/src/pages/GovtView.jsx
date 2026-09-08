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
        setSearchError('❌ Hash not found in JNARDDC immutable ledger. Warning: May be fraudulent or unverified.');
      }
    } catch (err) {
      setSearchError('Error verifying with central ledger.');
    }
  };

  return (
    <div className="app-container">
      {/* Ministry Header */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '22px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}>
            <Landmark size={32} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', color: '#ffffff', margin: 0 }}>
                Ministry of Mines (MoM) · JNARDDC
              </h1>
              <span className="badge badge-copper">NATIONAL CRITICAL MINERAL TELEMETRY</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Smart India Hackathon 2026 · Problem Statement 26229: "Kabadiwala Connect"
            </p>
          </div>
        </div>
      </div>

      {/* STRATEGIC MINERAL TOTALS (LITHIUM, COBALT, NEODYMIUM, COPPER) */}
      <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Coins size={22} color="var(--copper)" />
        National Strategic Mineral Recovery Reserves (From Informal E-Waste):
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lithium (Li) Recovered</span>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981', margin: '4px 0' }}>
            {telemetry?.nationalTotals?.criticalMineralsRecovered?.lithiumKg || 84.5} kg
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Saves import dependence on China</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cobalt (Co) Recovered</span>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#f59e0b', margin: '4px 0' }}>
            {telemetry?.nationalTotals?.criticalMineralsRecovered?.cobaltKg || 320.4} kg
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Diverted from toxic acid wash</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #c084fc' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Neodymium Rare Earth (Nd)</span>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#c084fc', margin: '4px 0' }}>
            {telemetry?.nationalTotals?.criticalMineralsRecovered?.neodymiumKg || 112.0} kg
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Rare-earth permanent magnets</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #fb923c' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Refined Copper (Cu)</span>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fb923c', margin: '4px 0' }}>
            {telemetry?.nationalTotals?.criticalMineralsRecovered?.copperKg || 2450.0} kg
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>99.9% pure wire-grade</span>
        </div>
      </div>

      {/* STATE RECOVERY HEATMAP & FORMALIZATION IMPACT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* State Heatmap Table */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--primary)" />
            State-Wise Critical Mineral Formalization
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {telemetry?.stateHeatmap?.map((item) => (
              <div key={item.state} style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#ffffff' }}>{item.state}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {item.collectorsCount} collectors · {item.recyclersCount} approved recyclers
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', color: 'var(--primary)' }}>{item.recoveredKg} kg</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--copper)' }}>{item.lithiumKg} kg Li · {item.cobaltKg} kg Co</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Comparison: Burning vs Scrap Sathi */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--copper)" />
            Economic & Health Value Comparison
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)', fontWeight: '700', fontSize: '0.85rem' }}>
                <Flame size={16} /> Informal Acid/Burning Route (Traditional)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
                Only recovers coarse copper (~₹115/kg). Lithium, cobalt, and rare earths are destroyed. Releases carcinogenic dioxins, lead vapor, and toxic runoff.
              </p>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>
                <Leaf size={16} /> Scrap Sathi Formal Hydrometallurgy Route
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
                Full critical mineral extraction (~₹295/kg, <strong>+156% higher income for kabadiwalas</strong>). Certified zero-emission pyrometallurgy and hydrometallurgy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PUBLIC VERIFIABLE EPR LEDGER EXPLORER */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} color="var(--primary)" />
          JNARDDC Central Blockchain/SHA-256 EPR Verification Portal
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Enter any Batch ID, Certificate Number, or SHA-256 cryptographic hash to verify authentic chain of custody.
        </p>

        <form onSubmit={handleVerifyHash} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            type="text"
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            placeholder="e.g. 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08 or EPR-IN-2026-9921"
            style={{ flex: 1, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '10px 14px', color: '#ffffff', fontSize: '0.9rem', outline: 'none' }}
          />
          <button type="submit" className="btn-tactile btn-primary" style={{ padding: '10px 20px' }}>
            <Search size={16} /> Verify Hash
          </button>
        </form>

        {searchError && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '10px', justifyContent: 'center' }}>
            {searchError}
          </div>
        )}

        {verifiedResult && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '16px', marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color="var(--primary)" />
                <strong style={{ color: '#ffffff' }}>Authentic EPR Record Verified by Ministry of Mines</strong>
              </div>
              <button
                onClick={() => setViewingCertificate(verifiedResult)}
                className="btn-tactile btn-glass"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                View Full Certificate
              </button>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Certificate: <strong>{verifiedResult.certificateNumber}</strong> · Material: {verifiedResult.materialType} ({verifiedResult.weightKg} kg)
            </div>
          </div>
        )}
      </div>

      {viewingCertificate && (
        <EPRCertificateModal
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </div>
  );
};
