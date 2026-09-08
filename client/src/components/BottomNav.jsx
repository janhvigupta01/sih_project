import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, Camera, Users, Award, ShieldAlert, User, DollarSign, ListOrdered } from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'price_board', label: t('navPriceBoard'), icon: TrendingUp },
    { id: 'scan_identify', label: t('navScan'), icon: Camera, highlight: true },
    { id: 'best_match', label: t('navBestMatch'), icon: ListOrdered },
    { id: 'pool_team', label: t('navPool'), icon: Users },
    { id: 'my_khata', label: t('navKhata'), icon: DollarSign },
    { id: 'safety_tips', label: t('navSafety'), icon: ShieldAlert },
    { id: 'my_profile', label: t('navProfile'), icon: User }
  ];

  return (
    <nav
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        margin: '0 auto',
        maxWidth: '700px',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTop: '1px solid var(--border-glow)',
        background: 'rgba(8, 12, 20, 0.94)',
        backdropFilter: 'blur(20px)',
        zIndex: 1000,
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.8)'
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isHighlight = item.highlight;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: isHighlight
                ? isActive
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'rgba(16, 185, 129, 0.2)'
                : 'transparent',
              border: isHighlight ? '1px solid var(--primary)' : 'none',
              borderRadius: isHighlight ? '16px' : '10px',
              padding: isHighlight ? '8px 12px' : '6px 8px',
              color: isActive ? (isHighlight ? '#ffffff' : 'var(--primary)') : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: isHighlight ? '64px' : '50px'
            }}
          >
            <Icon size={isHighlight ? 22 : 18} color={isActive ? (isHighlight ? '#ffffff' : '#10b981') : '#94a3b8'} />
            <span style={{ fontSize: '0.65rem', fontWeight: isActive ? '700' : '500', whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
