import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { OfflineProvider, useOffline } from './context/OfflineContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { CollectorApp } from './pages/CollectorApp';
import { RecyclerDashboard } from './pages/RecyclerDashboard';
import { GovtView } from './pages/GovtView';
import { AuthModal } from './pages/AuthModal';

const MainContent = () => {
  const { role } = useAuth();
  const { syncMessage } = useOffline();
  const [collectorTab, setCollectorTab] = useState('price_board');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Offline sync notification toast */}
      {syncMessage && (
        <div
          style={{
            margin: '10px 16px 0 16px',
            padding: '10px 16px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid var(--primary)',
            borderRadius: '12px',
            fontSize: '0.84rem',
            color: '#ffffff',
            textAlign: 'center'
          }}
        >
          {syncMessage}
        </div>
      )}

      {/* Role-Specific Application Views */}
      <main style={{ flex: 1, paddingBottom: role === 'collector' ? '80px' : '30px' }}>
        {role === 'collector' && (
          <CollectorApp activeTab={collectorTab} setActiveTab={setCollectorTab} />
        )}
        {role === 'recycler' && <RecyclerDashboard />}
        {role === 'govt' && <GovtView />}
      </main>

      {/* Collector Bottom Navigation Bar (Mobile Tactile Navigation) */}
      {role === 'collector' && (
        <BottomNav activeTab={collectorTab} setActiveTab={setCollectorTab} />
      )}

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <OfflineProvider>
          <MainContent />
        </OfflineProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
