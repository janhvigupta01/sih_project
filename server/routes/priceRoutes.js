const express = require('express');
const router = express.Router();
const { getPriceBoard, getPriceHistory } = require('../controllers/priceController');

router.get('/', getPriceBoard);
router.get('/history', getPriceHistory);

module.exports = router;
