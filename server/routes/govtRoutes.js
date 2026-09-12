const express = require('express');
const router = express.Router();
const { getNationalTelemetry } = require('../controllers/govtController');

router.get('/', getNationalTelemetry);
router.get('/telemetry', getNationalTelemetry);
router.get('/stats', getNationalTelemetry);

module.exports = router;
