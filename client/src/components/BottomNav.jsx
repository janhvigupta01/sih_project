import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, Camera, Package, ShieldAlert, User, Wallet, Sparkles } from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'price_board', label: t('navPriceBoard') || 'Rates', icon: TrendingUp },
    { id: 'pool_team', label: t('navPool') || 'Batches', icon: Package },
    { id: 'scan_identify', label: t('navScan') || 'Scan', icon: Camera, highlight: true },
    { id: 'my_khata', label: t('navKhata') || 'Earnings', icon: Wallet },
    { id: 'my_profile', label: t('navProfile') || 'Profile', icon: User }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        margin: '0 auto',
        maxWidth: '680px',
        padding: '8px 16px 12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        borderTop: '1px solid #e2e8f0',
        background: '#ffffff',
        zIndex: 1000,
        boxShadow: '0 -10px 30px rgba(15, 23, 42, 0.08)'
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isHighlight = item.highlight;

        if (isHighlight) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                position: 'relative',
                top: '-16px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#162544',
                border: '4px solid #ffffff',
                boxShadow: '0 8px 24px rgba(22, 37, 68, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#eab308',
                cursor: 'pointer',
                transition: 'all 0.22s ease'
              }}
            >
              <Camera size={24} color="#eab308" />
              <span style={{ fontSize: '0.62rem', fontWeight: '700', color: '#ffffff', marginTop: '1px' }}>
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: isActive ? '#ccfbf1' : 'transparent',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              color: isActive ? '#0d9488' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={20} color={isActive ? '#0d9488' : '#64748b'} />
            <span style={{ fontSize: '0.7rem', fontWeight: isActive ? '800' : '600', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
