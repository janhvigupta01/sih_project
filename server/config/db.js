const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows / Node.js c-ares DNS SRV lookup issues (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const { BENCHMARK_PRICES_INR, MINERAL_COEFFICIENTS, ROLES, BATCH_STATUS } = require('./constants');
const crypto = require('crypto');

// State flags
let isMongoConnected = false;

// Robust In-Memory Store (with default demo seeds so judges can test instantly without mongo setup)
const inMemoryStore = {
  users: [
    {
      _id: 'user_collector_1',
      name: 'Ramesh Kumar',
      phone: '9876543210',
      email: 'ramesh.collector@scrapsathi.in',
      passwordHash: '$2a$10$w85o30gQO7o/k9r5g2FjkuG76LhG5wN/nC6oGjBfHauVep1m5sKqK', // "password123"
      role: ROLES.COLLECTOR,
      language: 'hi', // Hindi default
      area: 'Dharavi, Mumbai, Maharashtra',
      trustScore: 94,
      totalEarned: 18450,
      totalOwed: 2200,
      isVerified: true,
      createdAt: new Date(Date.now() - 30 * 86400000)
    },
    {
      _id: 'user_collector_2',
      name: 'Santosh Shinde',
      phone: '9822334455',
      email: 'santosh.shinde@scrapsathi.in',
      passwordHash: '$2a$10$w85o30gQO7o/k9r5g2FjkuG76LhG5wN/nC6oGjBfHauVep1m5sKqK',
      role: ROLES.COLLECTOR,
      language: 'mr', // Marathi default
      area: 'Shivajinagar, Pune, Maharashtra',
      trustScore: 88,
      totalEarned: 12800,
      totalOwed: 0,
      isVerified: true,
      createdAt: new Date(Date.now() - 15 * 86400000)
    },
    {
      _id: 'user_recycler_1',
      name: 'EcoMetals Green Refining Pvt Ltd',
      phone: '9811223344',
      email: 'contact@ecometals.co.in',
      passwordHash: '$2a$10$w85o30gQO7o/k9r5g2FjkuG76LhG5wN/nC6oGjBfHauVep1m5sKqK',
      role: ROLES.RECYCLER,
      companyName: 'EcoMetals Green Refining Pvt Ltd',
      cpcbRegNumber: 'CPCB/EW-REG/MH/2024/9912',
      specializedIn: ['battery', 'circuit_board'],
      serviceArea: 'Mumbai Metropolitan Region & Pune',
      location: { lat: 19.076, lng: 72.8777, address: 'MIDC Industrial Area, Taloja, Navi Mumbai' },
      verified: true,
      isApprovedGovt: true,
      createdAt: new Date(Date.now() - 60 * 86400000)
    },
    {
      _id: 'user_recycler_2',
      name: 'RareEarth Hydrometallurgy Works',
      phone: '9844556677',
      email: 'ops@rareearthhydro.in',
      passwordHash: '$2a$10$w85o30gQO7o/k9r5g2FjkuG76LhG5wN/nC6oGjBfHauVep1m5sKqK',
      role: ROLES.RECYCLER,
      companyName: 'RareEarth Hydrometallurgy Works',
      cpcbRegNumber: 'CPCB/EW-REG/MH/2023/4512',
      specializedIn: ['motor', 'circuit_board', 'screen'],
      serviceArea: 'Pune - Pimpri Chinchwad Region',
      location: { lat: 18.5204, lng: 73.8567, address: 'Bhosari Industrial Estate, Pune' },
      verified: true,
      isApprovedGovt: true,
      createdAt: new Date(Date.now() - 90 * 86400000)
    },
    {
      _id: 'user_govt_1',
      name: 'JNARDDC / Ministry of Mines Portal',
      phone: '9900011223',
      email: 'officer@mines.gov.in',
      passwordHash: '$2a$10$w85o30gQO7o/k9r5g2FjkuG76LhG5wN/nC6oGjBfHauVep1m5sKqK',
      role: ROLES.GOVT,
      department: 'Critical Mineral Cell - JNARDDC Nagpur / Ministry of Mines',
      designation: 'Director of Resource Recovery',
      isVerified: true,
      createdAt: new Date(Date.now() - 120 * 86400000)
    }
  ],

  batches: [
    {
      _id: 'BATCH-2026-901',
      collectorId: 'user_collector_1',
      collectorName: 'Ramesh Kumar',
      collectorPhone: '9876543210',
      category: 'battery',
      categoryName: 'Lithium-Ion Battery',
      weightKg: 8.5,
      condition: 'Segregated cells & battery packs',
      photoUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=60',
      estimatedMetals: {
        lithium_g: 212.5,
        cobalt_g: 1190.0,
        neodymium_g: 0,
        copper_g: 1360.0,
        gold_g: 0
      },
      recoveryScore: 92,
      fairPricePerKg: 285,
      totalAgreedPrice: 2422.5,
      specialistBonus: 250,
      assignedRecyclerId: 'user_recycler_1',
      assignedRecyclerName: 'EcoMetals Green Refining Pvt Ltd',
      status: BATCH_STATUS.COMPLETED,
      isPaid: true,
      handoverOtp: '4892',
      handoverProof: {
        timestamp: new Date(Date.now() - 86400000 * 2),
        location: { lat: 19.043, lng: 72.855, address: 'Dharavi 90ft Road, Mumbai' },
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        otpVerified: true,
        photoVerified: true
      },
      createdAt: new Date(Date.now() - 86400000 * 3)
    },
    {
      _id: 'BATCH-2026-902',
      collectorId: 'user_collector_1',
      collectorName: 'Ramesh Kumar',
      collectorPhone: '9876543210',
      category: 'circuit_board',
      categoryName: 'Printed Circuit Board (PCB)',
      weightKg: 5.0,
      condition: 'Motherboards & telecom line cards',
      photoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60',
      estimatedMetals: {
        lithium_g: 0,
        cobalt_g: 12.5,
        neodymium_g: 6.0,
        copper_g: 925.0,
        gold_g: 1.4
      },
      recoveryScore: 96,
      fairPricePerKg: 510,
      totalAgreedPrice: 2550,
      specialistBonus: 180,
      assignedRecyclerId: 'user_recycler_1',
      assignedRecyclerName: 'EcoMetals Green Refining Pvt Ltd',
      status: BATCH_STATUS.PENDING_VERIFICATION,
      isPaid: false,
      handoverOtp: '7143',
      handoverProof: {
        timestamp: new Date(Date.now() - 3600000 * 4),
        location: { lat: 19.042, lng: 72.854, address: 'Dharavi Cross Road, Mumbai' },
        hash: 'b10a8db164e0754105b7a99be72e3fe5aa02e6005741b228b341f2bbd377b7f5',
        otpVerified: false,
        photoVerified: true
      },
      createdAt: new Date(Date.now() - 3600000 * 6)
    },
    {
      _id: 'BATCH-2026-903',
      collectorId: 'user_collector_2',
      collectorName: 'Santosh Shinde',
      collectorPhone: '9822334455',
      category: 'motor',
      categoryName: 'Electric Motor & Pump',
      weightKg: 14.0,
      condition: 'Intact copper wound stator with rare-earth magnets',
      photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=60',
      estimatedMetals: {
        lithium_g: 0,
        cobalt_g: 0,
        neodymium_g: 490.0,
        copper_g: 2940.0,
        gold_g: 0
      },
      recoveryScore: 89,
      fairPricePerKg: 195,
      totalAgreedPrice: 2730,
      specialistBonus: 220,
      assignedRecyclerId: 'user_recycler_2',
      assignedRecyclerName: 'RareEarth Hydrometallurgy Works',
      status: BATCH_STATUS.MATCHED,
      isPaid: false,
      handoverOtp: '3908',
      createdAt: new Date(Date.now() - 3600000 * 12)
    }
  ],

  batchPools: [
    {
      _id: 'POOL-MH-2026-01',
      name: 'Dharavi Rare Metals Aggregation Pool',
      targetMaterial: 'battery',
      targetWeightKg: 50.0,
      currentWeightKg: 28.5,
      membersCount: 4,
      bonusPercentage: 15, // +15% bonus for bulk batch to specialized hydrometallurgy
      status: 'active',
      area: 'Mumbai Central / Dharavi',
      batches: ['BATCH-2026-901'],
      specialistRecyclerId: 'user_recycler_1'
    }
  ],

  priceBoards: Object.entries(BENCHMARK_PRICES_INR).map(([key, data]) => ({
    materialKey: key,
    name: MINERAL_COEFFICIENTS[key]?.name || key,
    currentPrice: data.base,
    minPrice: data.min,
    maxPrice: data.max,
    trend: data.trend,
    changePct: data.changePct,
    updatedAt: new Date()
  })),

  eprCertificates: [
    {
      _id: 'EPR-JNARDDC-2026-0042',
      certificateNumber: 'EPR-IN-2026-9921',
      batchId: 'BATCH-2026-901',
      collectorName: 'Ramesh Kumar',
      recyclerName: 'EcoMetals Green Refining Pvt Ltd',
      cpcbRegNumber: 'CPCB/EW-REG/MH/2024/9912',
      materialType: 'Lithium-Ion Battery',
      weightKg: 8.5,
      criticalMetalsSaved: {
        lithium_g: 212.5,
        cobalt_g: 1190.0,
        copper_g: 1360.0
      },
      carbonOffsetKg: 42.8,
      issuingAuthority: 'Ministry of Mines (MoM) · JNARDDC National Portal',
      hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      qrVerificationUrl: 'https://scrapsathi.in/verify/EPR-JNARDDC-2026-0042',
      status: 'verified_active',
      issuedAt: new Date(Date.now() - 86400000 * 2)
    }
  ],

  auditLogs: [
    {
      _id: 'LOG-001',
      type: 'HANDOVER_SEALED',
      details: 'Batch BATCH-2026-901 cryptographically sealed with SHA-256',
      hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      ip: '127.0.0.1',
      timestamp: new Date(Date.now() - 86400000 * 2)
    }
  ],

  otps: new Map() // phone -> { otp, expiresAt }
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI) {
    try {
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 3000
      });
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB successfully.');
      return;
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed, falling back to in-memory store:', err.message);
    }
  } else {
    console.log('ℹ️ No MONGODB_URI provided. Running in high-performance zero-config in-memory database mode.');
  }
};

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  inMemoryStore
};
