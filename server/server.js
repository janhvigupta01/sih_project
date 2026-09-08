require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { connectDB, inMemoryStore } = require('./config/db');
const { setupSecurity } = require('./middleware/securityHeaders');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (or In-Memory Fallback)
connectDB();

// Cyber Security Headers
setupSecurity(app);

// CORS Middleware
app.use(cors({
  origin: '*', // Allow Capacitor mobile apps and web frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Rate Limiter for API protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', apiLimiter);

// Import API Routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const priceRoutes = require('./routes/priceRoutes');
const batchRoutes = require('./routes/batchRoutes');
const handoverRoutes = require('./routes/handoverRoutes');
const recyclerRoutes = require('./routes/recyclerRoutes');
const govtRoutes = require('./routes/govtRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/handover', handoverRoutes);
app.use('/api/recyclers', recyclerRoutes);
app.use('/api/govt', govtRoutes);

// Root & Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'SCRAP SATHI SIH 2026 Core Engine',
    version: '1.0.0',
    ministry: 'Ministry of Mines (MoM) · JNARDDC',
    problemStatement: '26229 - Kabadiwala Connect',
    database: 'Active (Hybrid Mongo/In-Memory Seeded)',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date()
  });
});

// Serve frontend in production if built
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <body style="font-family:sans-serif; background:#0b0f19; color:#f3f4f6; padding:40px; text-align:center;">
            <h1 style="color:#10b981;">SCRAP SATHI API Server Running</h1>
            <p>Smart India Hackathon 2026 - Problem Statement 26229: Kabadiwala Connect</p>
            <p>Frontend dev server runs at <a href="http://localhost:5173" style="color:#38bdf8;">http://localhost:5173</a></p>
            <p style="color:#9ca3af;">Health Check: <a href="/api/health" style="color:#38bdf8;">/api/health</a></p>
          </body>
        </html>
      `);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error: ' + err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SCRAP SATHI API ENGINE ONLINE ON PORT ${PORT}`);
  console.log(`🏆 SIH 2026 Problem Statement 26229 - Kabadiwala Connect`);
  console.log(`🏛️ Ministry of Mines (MoM) · JNARDDC`);
  console.log(`🛡️ Cybersecurity: SHA-256 Ledger & Rate Limiter Active`);
  console.log(`🤖 AI Core: Stoichiometric & ML Dynamic Pricing Loaded`);
  console.log(`📱 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
