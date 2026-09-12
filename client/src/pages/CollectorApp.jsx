import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';
import { startVoiceRecognition } from '../utils/speech';
import { EPRCertificateModal } from '../components/EPRCertificateModal';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  Camera,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  Zap,
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  QrCode,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  RefreshCw,
  Plus,
  Coins,
  Cpu,
  Battery,
  Flame,
  Award,
  Trophy,
  Wifi,
  ChevronRight,
  Globe,
  Headphones
} from 'lucide-react';

export const CollectorApp = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const { t, language, narrate } = useLanguage();
  const { isOnline, queueOfflineAction } = useOffline();

  // Price Board State
  const [priceData, setPriceData] = useState([]);
  const [selectedState, setSelectedState] = useState('Maharashtra');

  // Scanner & AI State
  const [scannedImage, setScannedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState('battery');
  const [aiConfidence, setAiConfidence] = useState(94);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Real Camera State
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Weight & Price Calculator State
  const [weightInput, setWeightInput] = useState('8.5');
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [pricingEstimate, setPricingEstimate] = useState(null);
  const [metalEstimate, setMetalEstimate] = useState(null);

  // Recyclers & Best Match
  const [matchedRecyclers, setMatchedRecyclers] = useState([]);
  const [selectedRecycler, setSelectedRecycler] = useState(null);

  // Batches & Khata State
  const [myBatches, setMyBatches] = useState([]);
  const [activeLot, setActiveLot] = useState(null);
  const [activePools, setActivePools] = useState([]);
  const [totalEarned, setTotalEarned] = useState(18450);
  const [totalOwed, setTotalOwed] = useState(2200);

  // Handover Photo & Verification
  const [handoverPhoto, setHandoverPhoto] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Fetch live price board
  useEffect(() => {
    fetchPrices();
    fetchRecyclers();
    fetchPools();
    fetchMyBatches();
  }, [selectedState, language]);

  // Recalculate metals & price whenever category or weight changes
  useEffect(() => {
    if (detectedCategory && weightInput) {
      calculateMetalsAndPricing(detectedCategory, parseFloat(weightInput) || 1.0);
    }
  }, [detectedCategory, weightInput]);

  const fetchPrices = async () => {
    try {
      const res = await fetch(`/api/prices?state=${selectedState}&lang=${language}`);
      const data = await res.json();
      if (data.success) {
        setPriceData(data.prices);
      }
    } catch (e) {
      console.warn('Using offline price fallback');
    }
  };

  const fetchRecyclers = async () => {
    try {
      const res = await fetch(`/api/recyclers/approved?category=${detectedCategory}`);
      const data = await res.json();
      if (data.success) {
        setMatchedRecyclers(data.recyclers);
        if (data.recyclers.length > 0) setSelectedRecycler(data.recyclers[0]);
      }
    } catch (e) {}
  };

  const fetchPools = async () => {
    try {
      const res = await fetch('/api/batches/pools');
      const data = await res.json();
      if (data.success) setActivePools(data.pools);
    } catch (e) {}
  };

  const fetchMyBatches = async () => {
    try {
      const res = await fetch('/api/batches/my-batches', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('scrapsathi_token') || ''}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyBatches(data.batches);
        if (data.totalEarned) setTotalEarned(data.totalEarned);
        if (data.totalPending) setTotalOwed(data.totalPending);
        if (data.batches.length > 0 && !activeLot) {
          setActiveLot(data.batches[0]);
        }
      }
    } catch (e) {}
  };

  const calculateMetalsAndPricing = async (cat, weight) => {
    try {
      const res = await fetch('/api/ai/estimate-metals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat, weightKg: weight })
      });
      const data = await res.json();
      if (data.success) {
        setMetalEstimate(data.estimatedMetals);
        setPricingEstimate(data.pricing);
        setAiAnalysis(data);
      }
    } catch (e) {
      setPricingEstimate({
        pricePerKg: 285,
        fairTotalCash: Math.round(weight * 285),
        specialistBonus: Math.round(weight * 285 * 0.1),
        grandTotalWithBonus: Math.round(weight * 285 * 1.1)
      });
    }
  };

  const handleVoiceWeight = () => {
    setIsListeningMic(true);
    narrate(language === 'mr' ? 'वजन बोला, उदा. दहा किलो' : 'वजन बोलें, जैसे दस किलो');
    startVoiceRecognition({
      language,
      onResult: (transcript) => {
        setIsListeningMic(false);
        const match = transcript.match(/\d+(\.\d+)?/);
        if (match) {
          setWeightInput(match[0]);
          narrate(`${match[0]} किलो वजन दर्ज किया गया`);
        } else {
          setWeightInput('5.0');
        }
      },
      onError: () => setIsListeningMic(false),
      onEnd: () => setIsListeningMic(false)
    });
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by this browser.');
      return;
    }
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      setCameraError('Unable to open the camera. Please allow camera permissions.');
    }
  };

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOpen]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (activeTab !== 'scan_identify' && streamRef.current) {
      stopCamera();
    }
  }, [activeTab]);

  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setCameraError('Camera starting, please wait.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setScannedImage(imageData);
    stopCamera();
    setCameraError('');
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setDetectedCategory('battery');
      setAiConfidence(96);
      narrate('पहचान: Lithium Battery. मूल्य आंका जा रहा है.');
      setActiveTab('weight_price');
    }, 1200);
  };

  const handleConfirmBatch = async () => {
    const lotPayload = {
      category: detectedCategory,
      weightKg: parseFloat(weightInput) || 5.0,
      condition: 'Segregated critical mineral stock',
      photoUrl: scannedImage,
      location: { lat: 19.043, lng: 72.855, address: user?.area || 'Dharavi, Mumbai' }
    };

    if (!isOnline) {
      queueOfflineAction('CREATE_BATCH', lotPayload);
      const offlineBatch = {
        _id: 'OFFLINE-' + Date.now().toString().slice(-4),
        collectorName: user?.name || 'Ramesh Kumar',
        category: detectedCategory,
        weightKg: lotPayload.weightKg,
        grandTotal: Math.round(lotPayload.weightKg * 285),
        status: 'pending',
        handoverOtp: '1234'
      };
      setActiveLot(offlineBatch);
      setMyBatches([offlineBatch, ...myBatches]);
      setActiveTab('handover_proof');
      narrate('ऑफ़लाइन सुरक्षित किया गया!');
      return;
    }

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('scrapsathi_token') || ''}`
        },
        body: JSON.stringify(lotPayload)
      });
      const data = await res.json();
      if (data.success) {
        setActiveLot(data.batch);
        setMyBatches([data.batch, ...myBatches]);
        setActiveTab('handover_proof');
        narrate(`लॉट तैयार है! कोड ${data.batch.handoverOtp} है.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinPool = async (poolId) => {
    if (!activeLot) {
      alert('Please scan an item first to create a batch before joining a pool!');
      setActiveTab('scan_identify');
      return;
    }
    try {
      const res = await fetch('/api/batches/pool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('scrapsathi_token') || ''}`
        },
        body: JSON.stringify({ batchId: activeLot._id, poolId })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        alert('🎉 Joined pool successfully! +15% bulk bonus applied.');
        fetchPools();
        fetchMyBatches();
      }
    } catch (e) {}
  };

  return (
    <div className="app-container">
      {/* ============================================================ */}
      {/* SCREEN 1: PRICE BOARD & HOME (MATCHING SCREENSHOT 1 & 3)       */}
      {/* ============================================================ */}
      {activeTab === 'price_board' && (
        <div className="animate-fade-in">
          {/* USER WELCOME BAR (Matching Screenshot 1) */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60"
                alt="Ramesh"
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>Namaste, {user?.name || 'Ramesh Kumar'}</h2>
                  <CheckCircle size={18} color="#ca8a04" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem', background: '#ccfbf1', color: '#0f766e', border: 'none' }}>
                    Live Rates • 24 Oct
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Market</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const speech = priceData.map(p => p.voiceText).join(' ');
                narrate(speech);
              }}
              style={{ background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '24px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              <Volume2 size={18} color="#0284c7" />
              <span>Listen All Audio</span>
            </button>
          </div>

          {/* VOICE SEARCH SCRAP RATE CARD (Matching Screenshot 1) */}
          <div style={{ background: '#162544', borderRadius: '20px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', color: '#ffffff', boxShadow: '0 8px 30px -4px rgba(22, 37, 68, 0.25)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={26} color="#ffffff" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>Voice Search Scrap Rate</h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '2px 0 0 0' }}>"What is copper rate?"</p>
              </div>
            </div>

            <button
              onClick={handleVoiceWeight}
              style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', border: 'none', borderRadius: '24px', padding: '12px 24px', color: '#0f172a', fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(234, 179, 8, 0.4)' }}
            >
              <Volume2 size={18} />
              <span>Speak</span>
            </button>
          </div>

          {/* TODAY'S RATES SECTION (Matching Screenshot 1 & 3) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0d9488', fontWeight: '800' }}>₹</span> Today's Rates (Per KG)
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Scroll →</span>
          </div>

          {/* Rates Horizontal / Responsive Grid */}
          <div className="grid-responsive" style={{ marginBottom: '22px' }}>
            {priceData.map((item) => (
              <div
                key={item.key}
                className="category-card"
                onClick={() => {
                  narrate(item.voiceText);
                  setDetectedCategory(item.key);
                  setActiveTab('weight_price');
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Cpu size={24} color="#0d9488" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>
                        {t(`cat_${item.key}`) || item.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Bare Bright Stock
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      narrate(item.voiceText);
                    }}
                    style={{ background: '#e0f2fe', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Volume2 size={16} color="#0284c7" />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '10px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
                    ₹{item.pricePerKg}
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '500', marginLeft: '4px' }}>
                      /kg
                    </span>
                  </div>

                  <span className="badge badge-primary" style={{ background: '#d1fae5', color: '#047857', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}>
                    ↑ +₹12.00
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* TODAY'S SPECIAL BONUS BANNER (Matching Screenshot 1) */}
          <div style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', borderRadius: '20px', padding: '22px 24px', color: '#ffffff', boxShadow: '0 10px 30px -5px rgba(234, 179, 8, 0.4)', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                <Trophy size={28} color="#ca8a04" />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ background: '#162544', color: '#ffffff', fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px', borderRadius: '12px', letterSpacing: '0.05em' }}>
                  TODAY'S SPECIAL BONUS
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', margin: '6px 0 2px 0' }}>
                  Bring 10kg E-waste, get <span style={{ textDecoration: 'underline' }}>₹150 extra</span> instant cash!
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                  Direct bank or cash payout • Valid till 6:00 PM today ₹
                </p>
              </div>
            </div>
          </div>

          {/* BROWSE CATEGORIES CARDS (Matching Screenshot 3) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Browse Categories
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#0d9488', fontWeight: '700' }}>4 Main Categories</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '18px' }}>
              <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=60" alt="Heavy" style={{ width: '100%', height: '120px', borderRadius: '12px', objectFit: 'cover', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 2px 0' }}>Heavy Electronics</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>Compressors & Motors</p>
              <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none', fontWeight: '800' }}>
                ₹45 - ₹220/kg
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: '18px' }}>
              <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=60" alt="Mobiles" style={{ width: '100%', height: '120px', borderRadius: '12px', objectFit: 'cover', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 2px 0' }}>Mobiles & Laptops</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>Gold Pin PCBs & Boards</p>
              <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none', fontWeight: '800' }}>
                ₹150 - ₹450/pc
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', borderRadius: '18px' }}>
              <img src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&auto=format&fit=crop&q=60" alt="Solar" style={{ width: '100%', height: '120px', borderRadius: '12px', objectFit: 'cover', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 2px 0' }}>Solar & Power Units</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>Copper Coils & Panels</p>
              <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none', fontWeight: '800' }}>
                ₹110 - ₹280/kg
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 2: QUICK SCAN (MATCHING SCREENSHOT 5)                  */}
      {/* ============================================================ */}
      {activeTab === 'scan_identify' && (
        <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0 }}>Quick Scan</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none', fontWeight: '700' }}>
                AI Detection Active
              </span>
              <button onClick={() => narrate('Scan scrap photo')} style={{ background: '#fef3c7', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: '700', color: '#b45309', cursor: 'pointer' }}>
                <Volume2 size={14} /> Listen
              </button>
            </div>
          </div>

          {/* CAMERA FRAME CONTAINER (Matching Screenshot 5) */}
          <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '360px', background: '#162544', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)', marginBottom: '18px' }}>
            {cameraOpen ? (
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60" alt="E-Waste Scan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}

            {/* SCANNING OVERLAY BADGE (Matching Screenshot 5) */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(22, 37, 68, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', padding: '14px 20px', borderRadius: '16px', color: '#ffffff', minWidth: '260px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Cpu size={20} color="#34d399" />
                <strong style={{ fontSize: '1.05rem', color: '#ffffff' }}>Motherboard (PCB)</strong>
                <CheckCircle size={16} color="#34d399" />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 6px 0' }}>Smartphone PCB • 98% Purity</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fef08a' }}>₹340/kg</span>
                <span style={{ background: '#ca8a04', color: '#ffffff', fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                  GRADE A GOLD
                </span>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', background: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', padding: '10px 14px', borderRadius: '14px', textAlign: 'center', fontSize: '0.8rem' }}>
              Keep scrap aligned inside the square frame
            </div>
          </div>

          {/* CAMERA CONTROLS */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            {!cameraOpen ? (
              <button onClick={startCamera} className="btn-tactile btn-navy" style={{ flex: 1, padding: '15px' }}>
                <Camera size={20} /> Open Camera
              </button>
            ) : (
              <button onClick={handleCapturePhoto} className="btn-tactile btn-primary" style={{ flex: 1, padding: '15px' }}>
                <Camera size={20} /> Capture & Scan Photo
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 3: WEIGHT & DUAL PRICING NUMBERS                       */}
      {/* ============================================================ */}
      {activeTab === 'weight_price' && (
        <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none', marginBottom: '6px' }}>
              AI SCAN COMPLETED
            </span>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>{t(`cat_${detectedCategory}`)}</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{t('weightSubtitle')}</p>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', marginBottom: '18px' }}>
            <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
              {t('enterWeight')}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                step="0.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                style={{ flex: 1, background: '#f8fafc', border: '2px solid #0d9488', borderRadius: '12px', color: '#0f172a', fontSize: '1.7rem', fontWeight: '800', padding: '10px 16px', outline: 'none' }}
              />
              <button onClick={handleVoiceWeight} className={`btn-tactile ${isListeningMic ? 'btn-copper' : 'btn-primary'}`} style={{ padding: '14px 18px' }}>
                <Mic size={20} /> <span>{isListeningMic ? 'Listening...' : 'Voice Input'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', border: '2px solid #0d9488' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Cash Value (नकद भुगतान)</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0d9488', margin: '4px 0' }}>
                ₹{pricingEstimate?.fairTotalCash || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: '700' }}>
                + ₹{pricingEstimate?.specialistBonus || 0} Specialist Bonus
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', border: '2px solid #eab308' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Recovery Score (पर्यावरण अंक)</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ca8a04', margin: '4px 0' }}>
                {aiAnalysis?.recoveryScore || 92} / 100
              </div>
              <div style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: '700' }}>
                🌱 {aiAnalysis?.carbonOffsetKg || 42.8} kg CO₂ Offset
              </div>
            </div>
          </div>

          <button onClick={() => setActiveTab('best_match')} className="btn-tactile btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
            <span>{t('continueToMatch')}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 4: MY COLLECTION BATCHES (MATCHING SCREENSHOT 4)        */}
      {/* ============================================================ */}
      {activeTab === 'pool_team' && (
        <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
          {/* HEADER BANNER (Matching Screenshot 4) */}
          <div style={{ background: '#162544', borderRadius: '20px', padding: '20px 24px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', boxShadow: '0 8px 24px rgba(22, 37, 68, 0.2)' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', letterSpacing: '0.05em' }}>VERIFIED SCRAP LOTS</span>
              <h1 style={{ fontSize: '1.4rem', color: '#ffffff', margin: '2px 0 0 0' }}>My Collection Batches</h1>
            </div>
            <button onClick={() => setActiveTab('scan_identify')} className="btn-tactile btn-primary" style={{ padding: '10px 16px', fontSize: '0.85rem', background: '#0d9488' }}>
              <Plus size={16} /> New Batch
            </button>
          </div>

          {/* BATCH CARDS (Matching Screenshot 4) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="glass-panel" style={{ padding: '18px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none', fontWeight: '800' }}>BATCH-8821</span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>आज, 11:20 AM</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0d9488' }}>₹1,510</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '4px 0' }}>4.5 kg सर्वर मदरबोर्ड</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 10px 0' }}>ग्रीनटेक रिसायक्लर्स · ✔ सत्यापित (Paid)</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.82rem', color: '#0d9488', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> Digital Scale Slip
                </span>
                <span style={{ fontSize: '0.82rem', color: '#0d9488', fontWeight: '700', cursor: 'pointer' }}>View →</span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', borderRadius: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-primary" style={{ background: '#ccfbf1', color: '#0f766e', border: 'none', fontWeight: '800' }}>BATCH-8819</span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>कल, 04:45 PM</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0d9488' }}>₹8,160</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '4px 0' }}>12 kg तांबा तार छिला हुआ</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 10px 0' }}>इकोमेटल्स प्रा. लि. · ✔ सत्यापित (Paid)</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.82rem', color: '#0d9488', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> Digital Scale Slip
                </span>
                <span style={{ fontSize: '0.82rem', color: '#0d9488', fontWeight: '700', cursor: 'pointer' }}>View →</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 5: COLLECTOR PROFILE (MATCHING SCREENSHOT 2)            */}
      {/* ============================================================ */}
      {activeTab === 'my_profile' && (
        <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
          {/* PROFILE HEADER CARD (Matching Screenshot 2) */}
          <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)', overflow: 'hidden', marginBottom: '18px' }}>
            <div style={{ height: '80px', background: '#162544' }} />
            <div style={{ padding: '0 24px 24px 24px', textAlign: 'center', marginTop: '-45px' }}>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60"
                alt="Ramesh Kumar"
                style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid #ffffff', objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
                <h2 style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>रमेश कुमार (Ramesh Kumar)</h2>
                <CheckCircle size={20} color="#ca8a04" />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: '700', margin: '4px 0 16px 0' }}>
                Certified Scrap Sathi • South Delhi
              </p>

              {/* STATS ROW (Matching Screenshot 2) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>आईडी</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>SS-4091</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>रेटिंग</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ca8a04' }}>4.95 ★</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>कुल तौल</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0d9488' }}>1,420 kg</div>
                </div>
              </div>
            </div>
          </div>

          {/* DIGITAL SCALE CONNECTED CARD (Matching Screenshot 2) */}
          <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={24} color="#0d9488" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>Digital Scale (BT-409)</h3>
                <p style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: '700', margin: '2px 0 0 0' }}>
                  ● Bluetooth Active • Auto-Sync On
                </p>
              </div>
            </div>
            <button style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '6px 14px', borderRadius: '14px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
              Test
            </button>
          </div>

          {/* SETTINGS OPTIONS LIST (Matching Screenshot 2) */}
          <div className="glass-panel" style={{ padding: '10px 20px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe size={20} color="#0d9488" />
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>Language</span>
              </div>
              <span className="badge badge-primary" style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', fontWeight: '700' }}>
                English (Change)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Volume2 size={20} color="#0d9488" />
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>Voice Prompts</span>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: '700' }}>
                सदा चालू (Always On)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Headphones size={20} color="#0d9488" />
                <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>Support Helpline</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>
                1800-SCRAP-OK
              </span>
            </div>
          </div>
        </div>
      )}

      {/* EPR Certificate Modal Viewer */}
      {viewingCertificate && (
        <EPRCertificateModal certificate={viewingCertificate} onClose={() => setViewingCertificate(null)} />
      )}
    </div>
  );
};
