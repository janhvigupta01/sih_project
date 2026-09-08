const express = require('express');
const router = express.Router();
const {
  confirmHandover,
  getCertificates,
  verifyCertificateByHash
} = require('../controllers/handoverController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/confirm', authenticateToken, confirmHandover);
router.get('/certificates', getCertificates);
router.get('/verify/:identifier', verifyCertificateByHash);

module.exports = router;
