const express = require('express');
const router = express.Router();
const { getNationalTelemetry } = require('../controllers/govtController');

router.get('/telemetry', getNationalTelemetry);

module.exports = router;
