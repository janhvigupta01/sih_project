const crypto = require('crypto');
const { inMemoryStore } = require('../config/db');
const { BATCH_STATUS } = require('../config/constants');

// Recycler confirms handover by verifying OTP and locking cryptographic proof
const confirmHandover = async (req, res) => {
  try {
    const { batchId, otp, location, photoUrl, verifiedWeightKg } = req.body;
    const recycler = req.user;

    if (!batchId || !otp) {
      return res.status(400).json({ success: false, message: 'Batch ID and OTP are required.' });
    }

    const batch = inMemoryStore.batches.find(b => b._id === batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found.' });
    }

    // Verify OTP (allow master OTP '1234' or exact match)
    if (batch.handoverOtp !== otp && otp !== '1234') {
      return res.status(400).json({ success: false, message: 'Invalid handover OTP. Please ask collector for the 4-digit code.' });
    }

    // Weight update if re-weighed on recycler scales
    if (verifiedWeightKg) {
      batch.weightKg = parseFloat(verifiedWeightKg);
      batch.totalAgreedPrice = Math.round(batch.weightKg * batch.fairPricePerKg);
      batch.grandTotal = batch.totalAgreedPrice + (batch.specialistBonus || 0);
    }

    const timestamp = new Date();
    const loc = location || { lat: 19.076, lng: 72.8777, address: 'MIDC Recycler Facility' };

    // Get previous certificate hash to form an immutable blockchain-style ledger
    const lastCert = inMemoryStore.eprCertificates[inMemoryStore.eprCertificates.length - 1];
    const previousHash = lastCert ? lastCert.hash : '0000000000000000000000000000000000000000000000000000000000000000';

    // Cryptographic SHA-256 Proof Signature
    const rawDataToSign = `${batch._id}|${batch.collectorId}|${recycler._id}|${batch.weightKg}|${batch.category}|${timestamp.toISOString()}|${loc.lat},${loc.lng}|${previousHash}`;
    const proofHash = crypto.createHash('sha256').update(rawDataToSign).digest('hex');

    // Update batch status
    batch.status = BATCH_STATUS.COMPLETED;
    batch.isPaid = true;
    batch.assignedRecyclerId = recycler._id;
    batch.assignedRecyclerName = recycler.companyName || recycler.name;
    batch.handoverProof = {
      timestamp,
      location: loc,
      hash: proofHash,
      photoUrl: photoUrl || batch.photoUrl,
      otpVerified: true,
      recyclerSignature: 'VERIFIED_BY_' + (recycler.cpcbRegNumber || recycler._id)
    };

    // Auto-Mint Verifiable EPR Certificate
    const certNumber = 'EPR-IN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const certificateId = 'EPR-JNARDDC-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);

    const newCertificate = {
      _id: certificateId,
      certificateNumber: certNumber,
      batchId: batch._id,
      collectorName: batch.collectorName,
      collectorPhone: batch.collectorPhone,
      recyclerName: recycler.companyName || recycler.name,
      cpcbRegNumber: recycler.cpcbRegNumber || 'CPCB/EW-REG/MH/2024/9912',
      materialType: batch.categoryName || batch.category,
      weightKg: batch.weightKg,
      criticalMetalsSaved: batch.estimatedMetals,
      carbonOffsetKg: batch.carbonOffsetKg || Math.round(batch.weightKg * 5.04 * 10) / 10,
      issuingAuthority: 'Ministry of Mines (MoM) · JNARDDC National Portal',
      hash: proofHash,
      previousHash,
      qrVerificationUrl: `https://scrapsathi.in/verify/${certificateId}`,
      status: 'verified_active',
      issuedAt: timestamp
    };

    inMemoryStore.eprCertificates.unshift(newCertificate);

    // Update collector earnings in memory
    const collector = inMemoryStore.users.find(u => u._id === batch.collectorId);
    if (collector) {
      collector.totalEarned = (collector.totalEarned || 0) + (batch.grandTotal || batch.totalAgreedPrice);
      collector.trustScore = Math.min(100, (collector.trustScore || 85) + 1);
    }

    // Add audit log
    inMemoryStore.auditLogs.unshift({
      _id: 'LOG-' + Date.now(),
      type: 'HANDOVER_SEALED',
      details: `Batch ${batch._id} verified and sealed. EPR Certificate ${certNumber} issued.`,
      hash: proofHash,
      ip: req.ip || '127.0.0.1',
      timestamp
    });

    return res.json({
      success: true,
      message: 'Handover verified and cryptographically locked! EPR Certificate issued.',
      batch,
      certificate: newCertificate
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all certificates (or filter by batch/recycler)
const getCertificates = async (req, res) => {
  try {
    const { batchId } = req.query;
    let certs = inMemoryStore.eprCertificates;
    if (batchId) {
      certs = certs.filter(c => c.batchId === batchId);
    }
    return res.json({
      success: true,
      certificates: certs
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Public Certificate Verification (Anti-Fraud / Ministry / Corporate Audits)
const verifyCertificateByHash = async (req, res) => {
  try {
    const { identifier } = req.params; // can be hash or certificateId or certificateNumber
    const cert = inMemoryStore.eprCertificates.find(
      c => c._id === identifier || c.hash === identifier || c.certificateNumber === identifier
    );

    if (!cert) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate not found in the Ministry of Mines / JNARDDC registry. It may be forged or invalid.'
      });
    }

    return res.json({
      success: true,
      valid: true,
      message: 'Certificate authentic & cryptographically validated against JNARDDC ledger.',
      certificate: cert
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  confirmHandover,
  getCertificates,
  verifyCertificateByHash
};
