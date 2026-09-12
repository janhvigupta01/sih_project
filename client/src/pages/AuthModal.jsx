import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Phone, KeyRound, Mail, Lock, User, ArrowRight, X, Shield, Sparkles } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, loginWithPhoneOtp, loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  const [tab, setTab] = useState('phone');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');

  if (!authModalOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setDevOtp(data.devOtp || '1234');
        setOtp(data.devOtp || '1234');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setOtpSent(true);
      setDevOtp('1234');
      setOtp('1234');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await loginWithPhoneOtp(phone, otp || '1234');
    setLoading(false);
    if (res.success) {
      setAuthModalOpen(false);
    } else {
      setError('Invalid OTP code');
    }
  };

  const handleGoogleMock = () => {
    loginWithGoogle({
      googleId: 'goog_sih_' + Date.now(),
      name: 'Priya Sharma (Green Partner)',
      email: 'priya.green@gmail.com',
      role: 'collector'
    });
    setAuthModalOpen(false);
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email || phone, password })
      });
      const data = await res.json();
      if (data.success) {
        setAuthModalOpen(false);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2500,
        padding: '16px'
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '28px',
          borderRadius: '24px',
          position: 'relative',
          border: '1px solid #cbd5e1',
          background: '#ffffff',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)'
        }}
      >
        <button
          onClick={() => setAuthModalOpen(false)}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#162544', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
            <Shield size={28} color="#eab308" />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>{t('loginTitle')}</h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
            Ministry of Mines (MoM) · JNARDDC · SIH 2026
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '18px' }}>
          <button
            onClick={() => setTab('phone')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'phone' ? '#0d9488' : 'transparent',
              color: tab === 'phone' ? '#ffffff' : '#64748b',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📱 Phone OTP
          </button>
          <button
            onClick={() => setTab('password')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: tab === 'password' ? '#0d9488' : 'transparent',
              color: tab === 'password' ? '#ffffff' : '#64748b',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🔑 Password
          </button>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '8px', marginBottom: '12px', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        {/* Phone OTP Form */}
        {tab === 'phone' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  {t('phoneLabel')}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '0 14px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '700', marginRight: '8px' }}>+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    style={{ background: 'transparent', border: 'none', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', padding: '12px 0', width: '100%', outline: 'none' }}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-tactile btn-primary" style={{ width: '100%' }}>
                  <Phone size={18} /> {loading ? 'Sending SMS...' : t('sendOtp')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ background: '#d1fae5', padding: '10px', borderRadius: '10px', border: '1px solid #a7f3d0', marginBottom: '14px', fontSize: '0.84rem', color: '#047857', fontWeight: '700' }}>
                  ✅ SMS simulated to +91-{phone}! Code: <strong>{devOtp || '1234'}</strong>
                </div>
                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                  {t('enterOtpLabel')}
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="4-digit code"
                  maxLength={4}
                  style={{ background: '#f8fafc', border: '2px solid #0d9488', borderRadius: '12px', color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '0.3em', textAlign: 'center', padding: '10px', width: '100%', outline: 'none', marginBottom: '16px' }}
                />
                <button type="submit" disabled={loading} className="btn-tactile btn-primary" style={{ width: '100%' }}>
                  <KeyRound size={18} /> {loading ? 'Verifying...' : t('verifyAndLogin')}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Password Form */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordLogin}>
            <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
              Email or Mobile Number
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ramesh.collector@scrapsathi.in"
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '0.95rem', padding: '10px 14px', width: '100%', outline: 'none', marginBottom: '14px' }}
            />
            <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '0.95rem', padding: '10px 14px', width: '100%', outline: 'none', marginBottom: '16px' }}
            />
            <button type="submit" disabled={loading} className="btn-tactile btn-primary" style={{ width: '100%' }}>
              <Lock size={18} /> Log In with Password
            </button>
          </form>
        )}

        {/* Google Mock Button */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>OR</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
          </div>
          <button onClick={handleGoogleMock} className="btn-tactile btn-glass" style={{ width: '100%', fontSize: '0.88rem', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{t('googleLogin')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
