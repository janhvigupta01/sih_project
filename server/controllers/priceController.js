const { inMemoryStore } = require('../config/db');
const { BENCHMARK_PRICES_INR, MINERAL_COEFFICIENTS } = require('../config/constants');

// Get all live prices
const getPriceBoard = async (req, res) => {
  try {
    const { state = 'Maharashtra', lang = 'hi' } = req.query;

    const prices = Object.entries(BENCHMARK_PRICES_INR).map(([key, data]) => {
      const meta = MINERAL_COEFFICIENTS[key];
      // Regional slight variation simulation
      let stateMultiplier = 1.0;
      if (state === 'Delhi') stateMultiplier = 1.02;
      else if (state === 'Karnataka') stateMultiplier = 1.03;
      else if (state === 'Gujarat') stateMultiplier = 0.99;

      const adjustedPrice = Math.round(data.base * stateMultiplier);

      // Hindi voice audio text
      const voiceHindi = `आज ${meta.name} का भाव ${adjustedPrice} रुपये प्रति किलो है। रुझान ${data.trend === 'up' ? 'तेज' : data.trend === 'down' ? 'गिरावट' : 'स्थिर'} है।`;
      
      // Marathi voice audio text
      const voiceMarathi = `आज ${meta.name} चा भाव ${adjustedPrice} रुपये प्रति किलो आहे. कल ${data.trend === 'up' ? 'वाढता' : 'स्थिर'} आहे.`;

      // English voice text
      const voiceEnglish = `Today's price for ${meta.name} is ₹${adjustedPrice} per kg, trending ${data.trend}.`;

      return {
        key,
        name: meta.name,
        pricePerKg: adjustedPrice,
        min: Math.round(data.min * stateMultiplier),
        max: Math.round(data.max * stateMultiplier),
        trend: data.trend, // 'up' | 'down' | 'stable'
        changePct: data.changePct,
        state,
        voiceText: lang === 'mr' ? voiceMarathi : lang === 'en' ? voiceEnglish : voiceHindi,
        hazardousLevel: meta.hazardous_level,
        handlingTip: meta.handling_tip,
        updatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
    });

    return res.json({
      success: true,
      state,
      language: lang,
      updatedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      prices
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Historical Price Trends (Last 7 Days) for Charting & Data Science
const getPriceHistory = async (req, res) => {
  try {
    const { material = 'battery' } = req.query;
    const base = BENCHMARK_PRICES_INR[material]?.base || 250;

    // Generate last 7 days realistic price fluctuations
    const history = [];
    const days = ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'];
    
    // Controlled trend
    const deltas = [-12, -8, -5, +2, +6, +10, +15];

    days.forEach((day, idx) => {
      history.push({
        day,
        date: new Date(Date.now() - (6 - idx) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        price: base + deltas[idx],
        lmeIndex: Math.round(18000 + (deltas[idx] * 40)) // London Metal Exchange proxy
      });
    });

    return res.json({
      success: true,
      material,
      materialName: MINERAL_COEFFICIENTS[material]?.name || material,
      history
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPriceBoard,
  getPriceHistory
};
