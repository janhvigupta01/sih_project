const helmet = require('helmet');

const setupSecurity = (app) => {
  // Helmet with relaxed policies for local development and PWA resources
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );

  // Security audit logger middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Powered-By', 'ScrapSathi-CyberShield');
    next();
  });
};

module.exports = { setupSecurity };
