import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';
import { Volume2, VolumeX, Globe, Wifi, WifiOff, ShieldCheck, UserCheck, RefreshCw, LogIn, ChevronDown } from 'lucide-react';

export const Navbar = () => {
  const { user, role, switchDemoAccount, setAuthModalOpen, logout } = useAuth();
  const { language, setLanguage, voiceEnabled, setVoiceEnabled, isSpeaking, stopAudio, t } = useLanguage();
  const { isOnline, queueCount, syncQueuedData, isSyncing } = useOffline();
  const [roleDropdown, setRoleDropdown] = useState(false);

  return (
    <header className="glass-panel" style={{ margin: '12px 16px 0 16px', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', zIndex: 100 }}>
      {/* Brand & SIH Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)' }}>
          <ShieldCheck size={26} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('appName')}
            </span>
            <span className="badge badge-copper" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              SIH 2026 · PS 26229
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
            Ministry of Mines (MoM) · JNARDDC
          </p>
        </div>
      </div>

      {/* Control Actions: Language, Audio, Network Status, User Role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '20px', padding: '3px', border: '1px solid var(--border-glass)' }}>
          <button
            onClick={() => setLanguage('hi')}
            style={{
              padding: '4px 10px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: language === 'hi' ? 'var(--primary)' : 'transparent',
              color: language === 'hi' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage('mr')}
            style={{
              padding: '4px 10px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: language === 'mr' ? 'var(--primary)' : 'transparent',
              color: language === 'mr' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            मराठी
          </button>
          <button
            onClick={() => setLanguage('en')}
            style={{
              padding: '4px 10px',
              borderRadius: '16px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: language === 'en' ? 'var(--primary)' : 'transparent',
              color: language === 'en' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            EN
          </button>
        </div>

        {/* Audio Narration Toggle */}
        <button
          onClick={() => {
            if (isSpeaking) stopAudio();
            else setVoiceEnabled(!voiceEnabled);
          }}
          className={`btn-tactile btn-glass ${isSpeaking ? 'audio-pulse' : ''}`}
          style={{ padding: '8px 12px', fontSize: '0.82rem' }}
          title={voiceEnabled ? 'Voice narration active (Click to mute)' : 'Voice narration muted'}
        >
          {voiceEnabled ? (
            <Volume2 size={16} color={isSpeaking ? '#10b981' : '#f59e0b'} />
          ) : (
            <VolumeX size={16} color="var(--text-dim)" />
          )}
          <span style={{ fontSize: '0.78rem' }}>{isSpeaking ? 'Speaking...' : voiceEnabled ? 'Audio On' : 'Muted'}</span>
        </button>

        {/* Offline / Online Sync Indicator */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isOnline ? (
            <div className="badge badge-primary" style={{ padding: '6px 10px' }} title="Online and connected to Scrap Sathi cloud">
              <Wifi size={14} />
              <span>Live</span>
            </div>
          ) : (
            <div className="badge badge-danger" style={{ padding: '6px 10px' }} title="Offline: deals queued in IndexedDB">
              <WifiOff size={14} />
              <span>Offline ({queueCount})</span>
            </div>
          )}
          {queueCount > 0 && isOnline && (
            <button
              onClick={syncQueuedData}
              disabled={isSyncing}
              className="btn-tactile btn-copper"
              style={{ padding: '6px 10px', marginLeft: '6px', fontSize: '0.75rem' }}
            >
              <RefreshCw size={12} className={isSyncing ? 'spin' : ''} />
              <span>Sync {queueCount}</span>
            </button>
          )}
        </div>

        {/* Role & Demo Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setRoleDropdown(!roleDropdown)}
            className="btn-tactile btn-glass"
            style={{ padding: '8px 14px', fontSize: '0.82rem', gap: '8px' }}
          >
            <UserCheck size={16} color="var(--primary)" />
            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
              <div style={{ fontWeight: '700', fontSize: '0.8rem' }}>{user?.name || 'Guest'}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--copper)' }}>
                {role === 'collector' ? 'Collector' : role === 'recycler' ? 'Recycler' : 'Govt View'}
              </div>
            </div>
            <ChevronDown size={14} color="var(--text-dim)" />
          </button>

          {roleDropdown && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '260px',
                padding: '10px',
                borderRadius: '12px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.8)',
                zIndex: 200,
                border: '1px solid var(--border-glow)'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '6px 8px', fontWeight: '700', textTransform: 'uppercase' }}>
                Quick Persona Switch (Demo)
              </div>
              <button
                onClick={() => { switchDemoAccount('collector_hindi'); setRoleDropdown(false); setLanguage('hi'); }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: role === 'collector' && user?.language === 'hi' ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: 'none', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', flexDirection: 'column' }}
              >
                <strong>🇮🇳 Ramesh (Hindi Collector)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dharavi, Mumbai · Phone OTP</span>
              </button>
              <button
                onClick={() => { switchDemoAccount('collector_marathi'); setRoleDropdown(false); setLanguage('mr'); }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: role === 'collector' && user?.language === 'mr' ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: 'none', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', flexDirection: 'column' }}
              >
                <strong>🚩 Santosh (Marathi Collector)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pune · Marathi Voice UI</span>
              </button>
              <button
                onClick={() => { switchDemoAccount('recycler'); setRoleDropdown(false); }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: role === 'recycler' ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: 'none', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', flexDirection: 'column' }}
              >
                <strong>🏭 EcoMetals Refining (Recycler)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CPCB Approved · Hydrometallurgy</span>
              </button>
              <button
                onClick={() => { switchDemoAccount('govt'); setRoleDropdown(false); }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: role === 'govt' ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: 'none', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', flexDirection: 'column' }}
              >
                <strong>🏛️ Ministry of Mines / JNARDDC</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>National Critical Minerals View</span>
              </button>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)', margin: '6px 0' }} />
              <button
                onClick={() => { setAuthModalOpen(true); setRoleDropdown(false); }}
                style={{ width: '100%', textAlign: 'left', padding: '8px 10px', background: 'transparent', border: 'none', borderRadius: '8px', color: 'var(--copper)', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogIn size={14} /> <span>Login with Phone OTP / Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
