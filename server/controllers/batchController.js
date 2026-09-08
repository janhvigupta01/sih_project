const { inMemoryStore } = require('../config/db');
const { estimateMetals, predictPrice } = require('./aiController');
const { BATCH_STATUS } = require('../config/constants');
const crypto = require('crypto');

// Create new e-waste batch
const createBatch = async (req, res) => {
  try {
    const { category, weightKg, condition = 'standard', photoUrl, location } = req.body;
    const collector = req.user;

    if (!category || !weightKg) {
      return res.status(400).json({ success: false, message: 'Category and weight in kg are required.' });
    }

    const weight = parseFloat(weightKg);
    const metalAnalysis = estimateMetals(category, weight);
    const pricing = predictPrice(category, weight, condition);

    const batchId = 'BATCH-2026-' + Math.floor(1000 + Math.random() * 9000);
    const handoverOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // Auto find best matched recycler
    const recyclers = inMemoryStore.users.filter(u => u.role === 'recycler');
    let matchedRecycler = recyclers.find(r => r.specializedIn?.includes(category)) || recyclers[0];

    const newBatch = {
      _id: batchId,
      collectorId: collector._id,
      collectorName: collector.name,
      collectorPhone: collector.phone,
      category,
      categoryName: metalAnalysis.categoryName,
      weightKg: weight,
      condition,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=60',
      estimatedMetals: metalAnalysis.estimatedMetals,
      recoveryScore: metalAnalysis.recoveryScore,
      carbonOffsetKg: metalAnalysis.carbonOffsetKg,
      fairPricePerKg: pricing.pricePerKg,
      totalAgreedPrice: pricing.fairTotalCash,
      specialistBonus: pricing.specialistBonus,
      grandTotal: pricing.grandTotalWithBonus,
      assignedRecyclerId: matchedRecycler ? matchedRecycler._id : null,
      assignedRecyclerName: matchedRecycler ? matchedRecycler.companyName || matchedRecycler.name : 'Government Registered Recycler',
      status: BATCH_STATUS.MATCHED,
      isPaid: false,
      handoverOtp,
      qrCodeData: `SCRAP_SATHI:${batchId}:${collector.phone}:${handoverOtp}`,
      location: location || { lat: 19.076, lng: 72.8777, address: collector.area || 'Mumbai, Maharashtra' },
      createdAt: new Date()
    };

    inMemoryStore.batches.unshift(newBatch);

    return res.status(201).json({
      success: true,
      message: 'Batch created and matched with specialist recycler!',
      batch: newBatch
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get batches for current logged-in collector
const getCollectorBatches = async (req, res) => {
  try {
    const collectorId = req.user._id;
    const batches = inMemoryStore.batches.filter(b => b.collectorId === collectorId);

    // Calculate running totals
    const totalEarned = batches
      .filter(b => b.isPaid)
      .reduce((sum, b) => sum + (b.grandTotal || b.totalAgreedPrice || 0), 0);

    const totalPending = batches
      .filter(b => !b.isPaid)
      .reduce((sum, b) => sum + (b.grandTotal || b.totalAgreedPrice || 0), 0);

    const criticalMetalsSaved = {
      lithium_g: batches.reduce((sum, b) => sum + (b.estimatedMetals?.lithium_g || 0), 0),
      cobalt_g: batches.reduce((sum, b) => sum + (b.estimatedMetals?.cobalt_g || 0), 0),
      neodymium_g: batches.reduce((sum, b) => sum + (b.estimatedMetals?.neodymium_g || 0), 0),
      copper_g: batches.reduce((sum, b) => sum + (b.estimatedMetals?.copper_g || 0), 0),
      gold_g: Math.round(batches.reduce((sum, b) => sum + (b.estimatedMetals?.gold_g || 0), 0) * 100) / 100
    };

    return res.json({
      success: true,
      batches,
      totalEarned,
      totalPending,
      criticalMetalsSaved
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Team up small batches into an aggregation pool
const poolBatches = async (req, res) => {
  try {
    const { batchId, poolId } = req.body;
    let pool = inMemoryStore.batchPools.find(p => p._id === poolId);

    if (!pool) {
      // Create new pool if not given
      const targetMaterial = req.body.targetMaterial || 'battery';
      pool = {
        _id: 'POOL-MH-2026-' + Math.floor(100 + Math.random() * 900),
        name: `${req.body.area || 'Dharavi'} Critical Metal Aggregation Pool`,
        targetMaterial,
        targetWeightKg: 50.0,
        currentWeightKg: 0,
        membersCount: 0,
        bonusPercentage: 15,
        status: 'active',
        area: req.body.area || 'Mumbai, Maharashtra',
        batches: [],
        createdAt: new Date()
      };
      inMemoryStore.batchPools.push(pool);
    }

    const batch = inMemoryStore.batches.find(b => b._id === batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found.' });
    }

    if (!pool.batches.includes(batchId)) {
      pool.batches.push(batchId);
      pool.currentWeightKg += batch.weightKg;
      pool.membersCount += 1;
      batch.status = BATCH_STATUS.POOLED;
      batch.poolId = pool._id;
      // Add +15% pooled team bonus
      batch.specialistBonus = Math.round((batch.totalAgreedPrice || 0) * 0.15);
      batch.grandTotal = (batch.totalAgreedPrice || 0) + batch.specialistBonus;
    }

    return res.json({
      success: true,
      message: 'Batch successfully pooled with nearby collectors! +15% bonus unlocked.',
      pool,
      batch
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all active batch pools
const getBatchPools = async (req, res) => {
  try {
    return res.json({
      success: true,
      pools: inMemoryStore.batchPools
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createBatch,
  getCollectorBatches,
  poolBatches,
  getBatchPools
};
