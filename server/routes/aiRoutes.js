const express = require('express');
const router = express.Router();
const {
  classifyImage,
  handleEstimateMetals,
  handlePredictPrice,
  handleCheckFairness
} = require('../controllers/aiController');

router.post('/classify-image', classifyImage);
router.post('/estimate-metals', handleEstimateMetals);
router.post('/predict-price', handlePredictPrice);
router.post('/check-fairness', handleCheckFairness);

module.exports = router;
