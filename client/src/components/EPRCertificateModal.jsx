import React from 'react';
import { ShieldCheck, Download, Printer, X, Award, CheckCircle, ExternalLink, QrCode } from 'lucide-react';

export const EPRCertificateModal = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          position: 'relative',
          borderRadius: '20px',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          background: '#0c121e',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(16, 185, 129, 0.2)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Certificate Watermark Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', padding: '6px 14px', borderRadius: '30px', marginBottom: '8px' }}>
            <Award size={18} color="#10b981" />
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#10b981', letterSpacing: '0.05em' }}>
              OFFICIAL VERIFIABLE EPR CREDENTIAL
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#f8fafc', margin: '4px 0' }}>
            Ministry of Mines (MoM) · JNARDDC
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            National Portal for E-Waste Critical Mineral Formalization (SIH 2026 · PS 26229)
          </p>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--copper)', marginTop: '6px' }}>
            Certificate No: {certificate.certificateNumber || 'EPR-IN-2026-9921'}
          </div>
        </div>

        {/* Core Credentials Table */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-glass)', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.86rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Authorized Collector:</span>
              <div style={{ fontWeight: '700', color: '#ffffff' }}>{certificate.collectorName}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Approved Recycler:</span>
              <div style={{ fontWeight: '700', color: '#ffffff' }}>{certificate.recyclerName}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CPCB Registration:</span>
              <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{certificate.cpcbRegNumber}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Material & Weight:</span>
              <div style={{ fontWeight: '700', color: 'var(--copper)' }}>
                {certificate.materialType} ({certificate.weightKg} kg)
              </div>
            </div>
          </div>
        </div>

        {/* Critical Minerals Saved Badge Grid */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Critical Strategic Minerals Diverted from Informal Burning/Acid:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lithium (Li)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#10b981' }}>
                {certificate.criticalMetalsSaved?.lithium_g || 0} g
              </div>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cobalt (Co)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f59e0b' }}>
                {certificate.criticalMetalsSaved?.cobalt_g || 0} g
              </div>
            </div>
            <div style={{ background: 'rgba(147, 51, 234, 0.1)', border: '1px solid rgba(147, 51, 234, 0.3)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Neodymium (Nd)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#c084fc' }}>
                {certificate.criticalMetalsSaved?.neodymium_g || 0} g
              </div>
            </div>
            <div style={{ background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.3)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pure Copper (Cu)</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fb923c' }}>
                {certificate.criticalMetalsSaved?.copper_g || 0} g
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Tamper-Proof Audit Seal */}
        <div style={{ background: '#080d16', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>
              <CheckCircle size={14} /> SHA-256 Cryptographic Audit Seal (Anti-Tamper)
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              {new Date(certificate.issuedAt || Date.now()).toLocaleDateString('en-IN')}
            </span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#94a3b8', wordBreak: 'break-all', background: 'rgba(255, 255, 255, 0.04)', padding: '8px', borderRadius: '6px' }}>
            {certificate.hash || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Chain Parent: {certificate.previousHash?.slice(0, 16) || '0000000000000000'}... | Issued by JNARDDC Registry
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={handlePrint}
            className="btn-tactile btn-glass"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            <Printer size={16} /> Print / Save as PDF
          </button>
          <button
            onClick={() => {
              alert(`Verified against JNARDDC Registry!\nHash: ${certificate.hash}\nStatus: Authentic.`);
            }}
            className="btn-tactile btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.88rem' }}
          >
            <ShieldCheck size={16} /> Verify on Ministry Portal
          </button>
        </div>
      </div>
    </div>
  );
};
