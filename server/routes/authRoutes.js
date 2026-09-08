const express = require('express');
const router = express.Router();
const {
  requestOtp,
  verifyOtp,
  googleAuth,
  login,
  register,
  forgotPassword,
  resetPassword,
  getProfile
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/google', googleAuth);
router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getProfile);

module.exports = router;
