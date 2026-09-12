const express = require('express');
const router = express.Router();
const {
  getApprovedRecyclers,
  getIncomingBatches,
  updateRecyclerProfile
} = require('../controllers/recyclerController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', getApprovedRecyclers);
router.get('/approved', getApprovedRecyclers);
router.get('/incoming', authenticateToken, getIncomingBatches);
router.put('/profile', authenticateToken, updateRecyclerProfile);

module.exports = router;
