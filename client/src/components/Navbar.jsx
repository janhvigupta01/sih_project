import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';
import { Volume2, VolumeX, Globe, Wifi, WifiOff, ShieldCheck, UserCheck, RefreshCw, LogIn, ChevronDown, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { user, role, switchDemoAccount, setAuthModalOpen, logout } = useAuth();
  const { language, setLanguage, voiceEnabled, setVoiceEnabled, isSpeaking, stopAudio, t } = useLanguage();
  const { isOnline, queueCount, syncQueuedData, isSyncing } = useOffline();
  const [roleDropdown, setRoleDropdown] = useState(false);

  return (
    <header style={{ background: '#ffffff', margin: '12px 16px 0 16px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', zIndex: 100, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)' }}>
      {/* Brand Logo & Name (Matching Screenshot 1 & 3) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#162544', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(22, 37, 68, 0.2)' }}>
          <ShieldCheck size={26} color="#eab308" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#162544' }}>
              {t('appName')}
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#0f766e', margin: 0, fontWeight: '700', letterSpacing: '0.04em' }}>
            HOME RATES · SIH 2026
          </p>
        </div>
      </div>

      {/* Right Controls: Audio Language Pill (Matching EN / हि Pill in Screenshot), Live Badge, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Audio Language Switcher Pill (Matching Screenshots: #e0f2fe background with speaker icon) */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#e0f2fe', borderRadius: '24px', padding: '4px 8px', border: '1px solid #bae6fd', gap: '6px' }}>
          <button
            onClick={() => {
              if (isSpeaking) stopAudio();
              else setVoiceEnabled(!voiceEnabled);
            }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0284c7' }}
            title="Toggle Voice Audio"
          >
            {voiceEnabled ? <Volume2 size={18} color="#0284c7" /> : <VolumeX size={18} color="#64748b" />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              onClick={() => setLanguage('hi')}
              style={{
                padding: '3px 8px',
                borderRadius: '14px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                background: language === 'hi' ? '#0284c7' : 'transparent',
                color: language === 'hi' ? '#ffffff' : '#0369a1'
              }}
            >
              हि
            </button>
            <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>/</span>
            <button
              onClick={() => setLanguage('en')}
              style={{
                padding: '3px 8px',
                borderRadius: '14px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                background: language === 'en' ? '#0284c7' : 'transparent',
                color: language === 'en' ? '#ffffff' : '#0369a1'
              }}
            >
              EN
            </button>
            <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>/</span>
            <button
              onClick={() => setLanguage('mr')}
              style={{
                padding: '3px 8px',
                borderRadius: '14px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                background: language === 'mr' ? '#0284c7' : 'transparent',
                color: language === 'mr' ? '#ffffff' : '#0369a1'
              }}
            >
              मराठी
            </button>
          </div>
        </div>

        {/* Live Engine Indicator */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isOnline ? (
            <div className="badge badge-primary" style={{ padding: '6px 12px', background: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0' }}>
              <Wifi size={14} />
              <span>Live Engine</span>
            </div>
          ) : (
            <div className="badge badge-danger" style={{ padding: '6px 12px' }}>
              <WifiOff size={14} />
              <span>Offline ({queueCount})</span>
            </div>
          )}
          {queueCount > 0 && isOnline && (
            <button
              onClick={syncQueuedData}
              disabled={isSyncing}
              className="btn-tactile btn-copper"
              style={{ padding: '6px 12px', marginLeft: '6px', fontSize: '0.78rem' }}
            >
              <RefreshCw size={13} className={isSyncing ? 'spin' : ''} />
              <span>Sync {queueCount}</span>
            </button>
          )}
        </div>

        {/* User Profile Circle & Persona Switcher (Matching Circle Avatar in Screenshots) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setRoleDropdown(!roleDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '24px',
              padding: '4px 12px 4px 6px',
              cursor: 'pointer'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"
              alt="Profile"
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
              <div style={{ fontWeight: '700', fontSize: '0.82rem', color: '#0f172a' }}>{user?.name?.split(' ')[0] || 'User'}</div>
              <div style={{ fontSize: '0.68rem', color: '#0d9488', fontWeight: '700' }}>
                {role === 'collector' ? 'Collector' : role === 'recycler' ? 'Recycler' : 'Govt'}
              </div>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {roleDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '280px',
                padding: '12px',
                borderRadius: '16px',
                boxShadow: '0 15px 35px rgba(15, 23, 42, 0.15)',
                zIndex: 200,
                border: '1px solid #cbd5e1',
                background: '#ffffff'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#64748b', padding: '6px 8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Switch Persona (Demo)
              </div>
              <button
                onClick={() => { switchDemoAccount('collector_hindi'); setRoleDropdown(false); setLanguage('hi'); }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: role === 'collector' && user?.language === 'hi' ? '#ccfbf1' : 'transparent', border: 'none', borderRadius: '10px', color: '#0f172a', cursor: 'pointer', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', margin: '2px 0' }}
              >
                <strong style={{ color: '#0d9488' }}>🇮🇳 Ramesh (Hindi Collector)</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Dharavi, Mumbai · Phone OTP</span>
              </button>
              <button
                onClick={() => { switchDemoAccount('collector_marathi'); setRoleDropdown(false); setLanguage('mr'); }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: role === 'collector' && user?.language === 'mr' ? '#ccfbf1' : 'transparent', border: 'none', borderRadius: '10px', color: '#0f172a', cursor: 'pointer', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', margin: '2px 0' }}
              >
                <strong style={{ color: '#d97706' }}>🚩 Santosh (Marathi Collector)</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Pune · Marathi Voice UI</span>
              </button>
              <button
                onClick={() => { switchDemoAccount('recycler'); setRoleDropdown(false); }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: role === 'recycler' ? '#ccfbf1' : 'transparent', border: 'none', borderRadius: '10px', color: '#0f172a', cursor: 'pointer', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', margin: '2px 0' }}
              >
                <strong style={{ color: '#0284c7' }}>🏭 EcoMetals Refining (Recycler)</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>CPCB Approved · Hydrometallurgy</span>
              </button>
              <button
                onClick={() => { switchDemoAccount('govt'); setRoleDropdown(false); }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: role === 'govt' ? '#ccfbf1' : 'transparent', border: 'none', borderRadius: '10px', color: '#0f172a', cursor: 'pointer', fontSize: '0.84rem', display: 'flex', flexDirection: 'column', margin: '2px 0' }}
              >
                <strong style={{ color: '#7c3aed' }}>🏛️ Ministry of Mines / JNARDDC</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>National Critical Minerals View</span>
              </button>
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
              <button
                onClick={() => { setAuthModalOpen(true); setRoleDropdown(false); }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '10px', color: '#d97706', cursor: 'pointer', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
              >
                <LogIn size={15} /> <span>Login with Phone OTP / Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
