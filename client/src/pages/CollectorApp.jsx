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
  Award
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
      // Fallback calculation
      setPricingEstimate({
        pricePerKg: 285,
        fairTotalCash: Math.round(weight * 285),
        specialistBonus: Math.round(weight * 285 * 0.1),
        grandTotalWithBonus: Math.round(weight * 285 * 1.1)
      });
    }
  };

  // Voice weight recognition
  const handleVoiceWeight = () => {
    setIsListeningMic(true);
    narrate(language === 'mr' ? 'वजन बोला, उदा. दहा किलो' : 'वजन बोलें, जैसे दस किलो');
    startVoiceRecognition({
      language,
      onResult: (transcript) => {
        setIsListeningMic(false);
        // Extract numbers from text (e.g. "8.5 kg" or "पाच किलो")
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

  // ============================================================
  // REAL CAMERA SCAN
  // Opens the laptop/phone camera, captures a frame, then runs
  // the existing demo AI result flow. The camera itself is real;
  // the classification is still demo logic until an AI model/API
  // is connected to the captured image.
  // ============================================================
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
      setCameraError('Camera access is not supported by this browser. Please use the latest Chrome or Edge.');
      return;
    }

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.error('Camera error:', error);

      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was blocked. Click the camera icon in the browser address bar and allow camera access, then try again.');
      } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        setCameraError('No camera was found. Connect a webcam or check that your laptop camera is enabled.');
      } else {
        setCameraError('Unable to open the camera. Please close other apps using the camera and try again.');
      }
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

    if (!video || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera is still starting. Please wait for the live preview and try again.');
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

    // Current project has demo classification logic.
    // Replace this block later with the real AI image-classification API.
    setTimeout(() => {
      setIsScanning(false);
      setDetectedCategory('battery');
      setAiConfidence(96);

      const categoryName = t('cat_battery');
      narrate(language === 'mr' ? `सापडले: ${categoryName}. किंमत मोजली जात आहे.` : `पहचान: ${categoryName}. मूल्य आंका जा रहा है.`);

      setActiveTab('weight_price');
    }, 1200);
  };

  // Create Lot / Confirm Batch
  const handleConfirmBatch = async () => {
    const lotPayload = {
      category: detectedCategory,
      weightKg: parseFloat(weightInput) || 5.0,
      condition: 'Segregated critical mineral stock',
      photoUrl: scannedImage,
      location: { lat: 19.043, lng: 72.855, address: user?.area || 'Dharavi, Mumbai' }
    };

    if (!isOnline) {
      // Save offline to IndexedDB queue
      await queueOfflineAction('batch_creation', lotPayload);
      const fakeOfflineBatch = {
        _id: 'BATCH-OFFLINE-' + Math.floor(1000 + Math.random() * 9000),
        category: detectedCategory,
        categoryName: t(`cat_${detectedCategory}`),
        weightKg: lotPayload.weightKg,
        totalAgreedPrice: pricingEstimate?.fairTotalCash || 1500,
        grandTotal: pricingEstimate?.grandTotalWithBonus || 1650,
        handoverOtp: '4921',
        status: 'matched',
        isOfflineQueued: true,
        createdAt: new Date()
      };
      setActiveLot(fakeOfflineBatch);
      setMyBatches([fakeOfflineBatch, ...myBatches]);
      setActiveTab('handover_proof');
      narrate('ऑफ़लाइन सुरक्षित किया गया! नेटवर्क आने पर सिंक होगा.');
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
        narrate(`लॉट तैयार है! आपका हैंडओवर कोड ${data.batch.handoverOtp} है.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Join Aggregation Pool
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
        alert('🎉 Joined pool successfully! +15% bulk bonus applied to your batch payout.');
        fetchPools();
        fetchMyBatches();
      }
    } catch (e) {}
  };

  return (
    <div className="app-container">
      {/* ============================================================ */}
      {/* SCREEN 2: PRICE BOARD                                         */}
      {/* ============================================================ */}
      {activeTab === 'price_board' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.6rem', color: '#ffffff' }}>{t('priceBoardTitle')}</h1>
                <span className="badge badge-primary">LIVE JNARDDC</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('priceBoardSubtitle')}</p>
            </div>

            {/* State selector & Audio listen button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                <option value="Delhi">Delhi-NCR (दिल्ली)</option>
                <option value="Karnataka">Karnataka (कर्नाटक)</option>
                <option value="Gujarat">Gujarat (गुजरात)</option>
              </select>
              <button
                onClick={() => {
                  const speech = priceData.map(p => p.voiceText).join(' ');
                  narrate(speech);
                }}
                className="btn-tactile btn-copper"
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
              >
                <Volume2 size={16} /> {t('listenAudio')}
              </button>
            </div>
          </div>

          {/* Price Grid */}
          <div className="grid-responsive">
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '2px' }}>
                      {t(`cat_${item.key}`) || item.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Range: ₹{item.min} - ₹{item.max}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      narrate(item.voiceText);
                    }}
                    style={{ background: 'rgba(245, 158, 11, 0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Volume2 size={15} color="var(--copper)" />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '12px' }}>
                  <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--primary)' }}>
                    ₹{item.pricePerKg}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400', marginLeft: '4px' }}>
                      /{t('pricePerKg')}
                    </span>
                  </div>
                  <div className={`badge ${item.trend === 'up' ? 'badge-primary' : item.trend === 'down' ? 'badge-danger' : 'badge-copper'}`}>
                    <TrendingUp size={12} style={{ transform: item.trend === 'down' ? 'rotate(180deg)' : 'none' }} />
                    <span>{item.changePct}</span>
                  </div>
                </div>

                <div style={{ marginTop: '12px', fontSize: '0.72rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-glass)', paddingTop: '8px' }}>
                  ⚠️ {item.handlingTip}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Button */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={() => setActiveTab('scan_identify')}
              className="btn-tactile btn-primary"
              style={{ padding: '16px 36px', fontSize: '1.15rem' }}
            >
              <Camera size={22} /> {t('scanTitle')}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 3: SCAN & IDENTIFY (AI CAMERA VIEW)                    */}
      {/* ============================================================ */}
      {activeTab === 'scan_identify' && (
        <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '1.55rem', color: '#ffffff' }}>{t('scanTitle')}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('scanSubtitle')}</p>
          </div>

          {/* REAL CAMERA VIEWFINDER */}
          <div
            className="glass-panel"
            style={{
              height: '320px',
              borderRadius: '24px',
              border: '2px dashed var(--primary)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: scannedImage
                ? `url(${scannedImage}) center/cover no-repeat`
                : 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(8, 12, 20, 0.95) 80%)'
            }}
          >
            {cameraOpen && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            )}

            {isScanning ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.48)', textAlign: 'center', zIndex: 10 }}>
                <div>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 14px auto' }} />
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>AI Detecting Critical Minerals...</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--copper)' }}>Analyzing captured e-waste image</div>
                </div>
              </div>
            ) : !cameraOpen && !scannedImage ? (
              <div style={{ textAlign: 'center', padding: '20px', zIndex: 10 }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'var(--primary-glow)', border: '1px solid var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Camera size={36} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '4px' }}>Point Camera at E-Waste</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Batteries, Circuit Boards, Copper Cables, Motors</p>
              </div>
            ) : null}

            {/* Viewfinder Target Reticle Overlay */}
            <div style={{ position: 'absolute', inset: '24px', border: '2px solid rgba(255, 255, 255, 0.25)', borderRadius: '16px', pointerEvents: 'none', zIndex: 5 }} />
          </div>

          {/* Camera Error */}
          {cameraError && (
            <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#fca5a5', fontSize: '0.8rem', lineHeight: '1.45', textAlign: 'center' }}>
              ⚠️ {cameraError}
            </div>
          )}

          {/* REAL CAMERA CONTROLS */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            {!cameraOpen && !isScanning && (
              <button
                onClick={startCamera}
                className="btn-tactile btn-primary"
                style={{ flex: 1, padding: '15px', fontSize: '1rem' }}
              >
                <Camera size={21} />
                <span>{scannedImage ? 'Scan Again' : 'Open Camera'}</span>
              </button>
            )}

            {cameraOpen && !isScanning && (
              <>
                <button
                  onClick={handleCapturePhoto}
                  className="btn-tactile btn-primary"
                  style={{ flex: 1, padding: '15px', fontSize: '1rem' }}
                >
                  <Camera size={21} />
                  <span>Capture & Scan</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="btn-tactile btn-glass"
                  style={{ padding: '15px 18px', fontSize: '0.9rem' }}
                >
                  Close
                </button>
              </>
            )}
          </div>

          {scannedImage && !cameraOpen && !isScanning && (
            <button
              onClick={() => {
                setScannedImage(null);
                setCameraError('');
                startCamera();
              }}
              className="btn-tactile btn-glass"
              style={{ width: '100%', marginTop: '10px', padding: '12px', fontSize: '0.88rem' }}
            >
              <RefreshCw size={17} /> Retake Photo
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 4: WEIGHT & PRICE DUAL SCORE DISPLAY                   */}
      {/* ============================================================ */}
      {activeTab === 'weight_price' && (
        <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <span className="badge badge-copper" style={{ marginBottom: '6px' }}>AI DETECTION COMPLETE</span>
            <h1 style={{ fontSize: '1.6rem', color: '#ffffff' }}>
              {t(`cat_${detectedCategory}`)}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('weightSubtitle')}</p>
          </div>

          {/* Weight Input Box with Voice Mic */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', marginBottom: '18px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              {t('enterWeight')}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '2px solid var(--primary)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '1.7rem',
                  fontWeight: '800',
                  padding: '10px 16px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleVoiceWeight}
                className={`btn-tactile ${isListeningMic ? 'btn-copper audio-pulse' : 'btn-primary'}`}
                style={{ padding: '14px 18px', fontSize: '0.9rem' }}
                title="Speak weight in Hindi or Marathi"
              >
                {isListeningMic ? <MicOff size={22} /> : <Mic size={22} />}
                <span>{isListeningMic ? 'Listening...' : t('speakWeight')}</span>
              </button>
            </div>
          </div>

          {/* DUAL NUMBERS: CASH PRICE + RECOVERY SCORE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
            {/* Number 1: Cash Value */}
            <div className="glass-panel-glow" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('cashValue')} (नकद भुगतान)
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', margin: '4px 0' }}>
                ₹{pricingEstimate?.fairTotalCash || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--copper)', fontWeight: '600' }}>
                + ₹{pricingEstimate?.specialistBonus || 0} {t('specialistBonus')}
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Rate: ₹{pricingEstimate?.pricePerKg || 0} / kg
              </div>
            </div>

            {/* Number 2: Critical Mineral Recovery Score */}
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('recoveryScore')} (पर्यावरण अंक)
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--gold)', margin: '4px 0' }}>
                {aiAnalysis?.recoveryScore || 92} / 100
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600' }}>
                🌱 {aiAnalysis?.carbonOffsetKg || 42.8} kg CO₂ Offset
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Government Approved Formalization
              </div>
            </div>
          </div>

          {/* LOOKING INSIDE THE WASTE: CRITICAL METALS BREAKDOWN */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '18px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--copper)" />
              {t('estimatedMetalsInside')}:
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('lithium')}</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>
                  {metalEstimate?.lithium_g || 0}g
                </div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('cobalt')}</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f59e0b' }}>
                  {metalEstimate?.cobalt_g || 0}g
                </div>
              </div>
              <div style={{ background: 'rgba(192, 132, 252, 0.08)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('neodymium')}</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#c084fc' }}>
                  {metalEstimate?.neodymium_g || 0}g
                </div>
              </div>
              <div style={{ background: 'rgba(251, 146, 60, 0.08)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('copper')}</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fb923c' }}>
                  {metalEstimate?.copper_g || 0}g
                </div>
              </div>
            </div>
          </div>

          {/* Action to find best match */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setActiveTab('best_match')}
              className="btn-tactile btn-primary"
              style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}
            >
              <span>{t('continueToMatch')}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 5: BEST MATCH LIST (SPECIALIST RECYCLER)               */}
      {/* ============================================================ */}
      {activeTab === 'best_match' && (
        <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <h1 style={{ fontSize: '1.55rem', color: '#ffffff' }}>{t('matchTitle')}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('matchSubtitle')}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {matchedRecyclers.map((recycler, index) => (
              <div
                key={recycler.id || index}
                className={`category-card ${selectedRecycler?.id === recycler.id ? 'selected' : ''}`}
                onClick={() => setSelectedRecycler(recycler)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>{recycler.name}</h3>
                      <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>CPCB VERIFIED</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--copper)', marginTop: '2px' }}>
                      🌟 {recycler.specializationBonus}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      {recycler.serviceArea} · 📍 {recycler.distanceKm} km away
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>
                      ₹{pricingEstimate?.grandTotalWithBonus || 2672}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Guaranteed Handover</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleConfirmBatch}
              className="btn-tactile btn-primary"
              style={{ flex: 1, padding: '16px', fontSize: '1.1rem' }}
            >
              <CheckCircle size={20} />
              <span>{t('selectRecycler')}</span>
            </button>
            <button
              onClick={() => setActiveTab('pool_team')}
              className="btn-tactile btn-copper"
              style={{ padding: '16px 20px', fontSize: '0.95rem' }}
            >
              <Users size={20} />
              <span>Team Up (+15%)</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 6: TEAM UP (BATCH POOLING FOR SMALL LOTS)              */}
      {/* ============================================================ */}
      {activeTab === 'pool_team' && (
        <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <span className="badge badge-copper" style={{ marginBottom: '6px' }}>FEATURE 4: SMALL BATCHES TEAM UP</span>
            <h1 style={{ fontSize: '1.55rem', color: '#ffffff' }}>{t('poolTitle')}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('poolSubtitle')}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {activePools.map((pool) => {
              const progressPct = Math.min(100, Math.round((pool.currentWeightKg / pool.targetWeightKg) * 100));

              return (
                <div key={pool._id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>{pool.name}</h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Target Material: <strong style={{ color: 'var(--copper)' }}>{t(`cat_${pool.targetMaterial}`)}</strong> ({pool.area})
                      </p>
                    </div>
                    <span className="badge badge-copper" style={{ fontSize: '0.8rem' }}>
                      +{pool.bonusPercentage}% BONUS
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ margin: '14px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <span>Progress: {pool.currentWeightKg} kg / {pool.targetWeightKg} kg</span>
                      <span>{progressPct}% Reached ({pool.membersCount} collectors)</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)', borderRadius: '10px' }} />
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinPool(pool._id)}
                    className="btn-tactile btn-copper"
                    style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
                  >
                    <Users size={18} /> {t('joinPoolBtn')}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => alert('New neighborhood pool created for Dharavi! Nearby collectors notified via SMS.')}
              className="btn-tactile btn-glass"
              style={{ padding: '12px 24px', fontSize: '0.9rem' }}
            >
              <Plus size={16} /> {t('createNewPool')}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 7 & 8: HAND IT OVER (OFFLINE PROOF & LIVE OTP)          */}
      {/* ============================================================ */}
      {activeTab === 'handover_proof' && activeLot && (
        <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '6px' }}>BATCH CONFIRMED</span>
            <h1 style={{ fontSize: '1.55rem', color: '#ffffff' }}>{t('handoverTitle')}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('handoverSubtitle')}</p>
          </div>

          {/* 4-Digit OTP Display */}
          <div className="glass-panel-glow" style={{ padding: '24px', textAlign: 'center', borderRadius: '20px', marginBottom: '18px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {t('handoverOtpCode')}
            </div>
            <div style={{ fontSize: '3.4rem', fontWeight: '900', letterSpacing: '0.25em', color: 'var(--primary)', margin: '8px 0', fontFamily: 'monospace' }}>
              {activeLot.handoverOtp || '4921'}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--copper)' }}>
              {t('giveOtpToRecycler')}
            </p>
          </div>

          {/* Proof Details */}
          <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Batch ID:</span>
                <div style={{ fontWeight: '700', color: '#ffffff' }}>{activeLot._id}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Status:</span>
                <div style={{ fontWeight: '700', color: activeLot.status === 'completed' ? 'var(--primary)' : 'var(--copper)' }}>
                  {activeLot.status === 'completed' ? 'Verified & Paid' : 'Waiting for Recycler'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Material & Weight:</span>
                <div style={{ fontWeight: '700', color: '#ffffff' }}>
                  {activeLot.categoryName || activeLot.category} ({activeLot.weightKg} kg)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Payout Amount:</span>
                <div style={{ fontWeight: '700', color: 'var(--primary)' }}>
                  ₹{activeLot.grandTotal || activeLot.totalAgreedPrice} (Cash)
                </div>
              </div>
            </div>
          </div>

          {/* Action: Simulate Recycler Verification */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/handover/confirm', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('scrapsathi_token') || ''}`
                    },
                    body: JSON.stringify({
                      batchId: activeLot._id,
                      otp: activeLot.handoverOtp || '4921',
                      verifiedWeightKg: activeLot.weightKg
                    })
                  });
                  const data = await res.json();
                  if (data.success) {
                    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
                    setActiveLot(data.batch);
                    setViewingCertificate(data.certificate);
                    narrate('बधाई! कबाड़ रीसाइक्लर को सौंप दिया गया है और पैसे आपके खाते में जुड़ गए हैं.');
                    fetchMyBatches();
                  }
                } catch (e) {
                  alert('Handover recorded locally.');
                }
              }}
              className="btn-tactile btn-primary"
              style={{ padding: '16px', fontSize: '1.05rem' }}
            >
              <CheckCircle size={20} />
              <span>Simulate Recycler Verification (Driver OTP Tap)</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 9: MY EARNINGS & KHATA                                 */}
      {/* ============================================================ */}
      {activeTab === 'my_khata' && (
        <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '1.6rem', color: '#ffffff' }}>{t('khataTitle')}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cash received, dues, and verified e-waste ledger</p>
          </div>

          {/* Running Totals Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('totalEarned')}</span>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--primary)', margin: '4px 0' }}>
                ₹{totalEarned}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Paid instantly in cash</span>
            </div>

            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('moneyOwed')}</span>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--copper)', margin: '4px 0' }}>
                ₹{totalOwed}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Pending pickup confirmation</span>
            </div>
          </div>

          {/* Past Deals List */}
          <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '12px' }}>
            {t('completedDeals')} ({myBatches.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myBatches.map((b) => (
              <div key={b._id} className="glass-panel" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#ffffff' }}>
                    {b.categoryName || b.category} ({b.weightKg} kg)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Lot ID: {b._id} · {new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN')}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)' }}>
                      ₹{b.grandTotal || b.totalAgreedPrice}
                    </div>
                    <span className={`badge ${b.status === 'completed' ? 'badge-primary' : 'badge-copper'}`} style={{ fontSize: '0.65rem' }}>
                      {b.status === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {b.status === 'completed' && (
                    <button
                      onClick={() => {
                        setViewingCertificate({
                          certificateNumber: 'EPR-IN-2026-' + Math.floor(1000 + Math.random() * 9000),
                          collectorName: user?.name || 'Ramesh Kumar',
                          recyclerName: b.assignedRecyclerName || 'EcoMetals Green Refining Pvt Ltd',
                          cpcbRegNumber: 'CPCB/EW-REG/MH/2024/9912',
                          materialType: b.categoryName || b.category,
                          weightKg: b.weightKg,
                          criticalMetalsSaved: b.estimatedMetals,
                          hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
                        });
                      }}
                      className="btn-tactile btn-glass"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    >
                      EPR Cert
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 10: SAFETY TIPS (AUDIO VISUAL FLASHCARDS)             */}
      {/* ============================================================ */}
      {activeTab === 'safety_tips' && (
        <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span className="badge badge-danger" style={{ marginBottom: '6px' }}>PROTECT YOUR HEALTH</span>
            <h1 style={{ fontSize: '1.6rem', color: '#ffffff' }}>{t('safetyTitle')}</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('safetySubtitle')}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Tip 1: No Wire Burning */}
            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--danger)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={22} color="var(--danger)" />
                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>{t('tipNoBurnTitle')}</h3>
                </div>
                <button
                  onClick={() => narrate(t('tipNoBurnDesc'))}
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Volume2 size={16} color="var(--danger)" />
                </button>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {t('tipNoBurnDesc')}
              </p>
            </div>

            {/* Tip 2: No Acid on PCBs */}
            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--copper)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={22} color="var(--copper)" />
                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>{t('tipNoAcidTitle')}</h3>
                </div>
                <button
                  onClick={() => narrate(t('tipNoAcidDesc'))}
                  style={{ background: 'rgba(245, 158, 11, 0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Volume2 size={16} color="var(--copper)" />
                </button>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {t('tipNoAcidDesc')}
              </p>
            </div>

            {/* Tip 3: Safe Battery Handling */}
            <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--primary)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Battery size={22} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>{t('tipBatteryTitle')}</h3>
                </div>
                <button
                  onClick={() => narrate(t('tipBatteryDesc'))}
                  style={{ background: 'rgba(16, 185, 129, 0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Volume2 size={16} color="var(--primary)" />
                </button>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {t('tipBatteryDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCREEN 11: PROFILE & TRUSTED COLLECTOR BADGE                  */}
      {/* ============================================================ */}
      {activeTab === 'my_profile' && (
        <div className="animate-fade-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}>
              <Award size={42} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#ffffff' }}>{user?.name}</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user?.phone} · {user?.area || 'Dharavi, Mumbai'}</p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--primary)', borderRadius: '30px', padding: '6px 16px', margin: '14px 0' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary)' }}>
                {t('trustedBadge')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Trust Score</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                  {user?.trustScore || 94}%
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Total Formalized</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                  142 kg
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Safety Level</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--copper)' }}>
                  Tier 1 Gold
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EPR Certificate Modal Viewer */}
      {viewingCertificate && (
        <EPRCertificateModal
          certificate={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </div>
  );
};
