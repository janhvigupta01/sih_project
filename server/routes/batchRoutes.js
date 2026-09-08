const express = require('express');
const router = express.Router();
const {
  createBatch,
  getCollectorBatches,
  poolBatches,
  getBatchPools
} = require('../controllers/batchController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createBatch);
router.get('/my-batches', authenticateToken, getCollectorBatches);
router.post('/pool', authenticateToken, poolBatches);
router.get('/pools', getBatchPools);

module.exports = router;
