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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          position: 'relative',
          borderRadius: '24px',
          border: '2px solid #0d9488',
          background: '#ffffff',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Certificate Watermark Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ccfbf1', padding: '6px 14px', borderRadius: '30px', marginBottom: '8px' }}>
            <Award size={18} color="#0f766e" />
            <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0f766e', letterSpacing: '0.05em' }}>
              OFFICIAL VERIFIABLE EPR CREDENTIAL
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#162544', margin: '4px 0' }}>
            Ministry of Mines (MoM) · JNARDDC
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            National Portal for E-Waste Critical Mineral Formalization (SIH 2026 · PS 26229)
          </p>
          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>
            Certificate No: {certificate.certificateNumber || 'EPR-IN-2026-9921'}
          </div>
        </div>

        {/* Core Credentials Table */}
        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.86rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Authorized Collector:</span>
              <div style={{ fontWeight: '800', color: '#0f172a' }}>{certificate.collectorName}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Approved Recycler:</span>
              <div style={{ fontWeight: '800', color: '#0f172a' }}>{certificate.recyclerName}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>CPCB Registration:</span>
              <div style={{ fontWeight: '700', color: '#0d9488' }}>{certificate.cpcbRegNumber}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Material & Weight:</span>
              <div style={{ fontWeight: '800', color: '#d97706' }}>
                {certificate.materialType} ({certificate.weightKg} kg)
              </div>
            </div>
          </div>
        </div>

        {/* Critical Minerals Saved Badge Grid */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Critical Strategic Minerals Saved:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
            <div style={{ background: '#ccfbf1', border: '1px solid #99f6e4', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#0f766e', fontWeight: '700' }}>Lithium (Li)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f766e' }}>
                {certificate.criticalMetalsSaved?.lithium_g || 0} g
              </div>
            </div>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: '700' }}>Cobalt (Co)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#b45309' }}>
                {certificate.criticalMetalsSaved?.cobalt_g || 0} g
              </div>
            </div>
            <div style={{ background: '#f3e8ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#6d28d9', fontWeight: '700' }}>Neodymium (Nd)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#6d28d9' }}>
                {certificate.criticalMetalsSaved?.neodymium_g || 0} g
              </div>
            </div>
            <div style={{ background: '#ffedd5', border: '1px solid #fed7aa', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#c2410c', fontWeight: '700' }}>Pure Copper (Cu)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#c2410c' }}>
                {certificate.criticalMetalsSaved?.copper_g || 0} g
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Audit Seal */}
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#0d9488', fontWeight: '800' }}>
              <CheckCircle size={15} /> SHA-256 Cryptographic Audit Seal (Anti-Tamper)
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {new Date(certificate.issuedAt || Date.now()).toLocaleDateString('en-IN')}
            </span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#0f172a', wordBreak: 'break-all', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px' }}>
            {certificate.hash || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={handlePrint} className="btn-tactile btn-glass" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
            <Printer size={16} /> Print / Save PDF
          </button>
          <button onClick={onClose} className="btn-tactile btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
            <ShieldCheck size={16} /> Close & Verify
          </button>
        </div>
      </div>
    </div>
  );
};
