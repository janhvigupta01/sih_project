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
      className="bottom-nav-glass"
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
        borderTopLeftRadius: '26px',
        borderTopRightRadius: '26px',
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
              className="pulse-glow-gold"
              style={{
                position: 'relative',
                top: '-18px',
                width: '62px',
                height: '62px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #162544 0%, #0f172a 100%)',
                border: '4px solid #ffffff',
                boxShadow: '0 8px 24px rgba(22, 37, 68, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#eab308',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Camera size={24} color="#eab308" className="animate-float" />
              <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#ffffff', marginTop: '1px' }}>
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
              border: isActive ? '1px solid #99f6e4' : '1px solid transparent',
              borderRadius: '20px',
              padding: '6px 14px',
              color: isActive ? '#0d9488' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isActive ? 'translateY(-2px)' : 'none',
              boxShadow: isActive ? '0 4px 12px rgba(13, 148, 136, 0.15)' : 'none'
            }}
          >
            <Icon size={20} color={isActive ? '#0d9488' : '#64748b'} />
            <span style={{ fontSize: '0.72rem', fontWeight: isActive ? '800' : '600', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
