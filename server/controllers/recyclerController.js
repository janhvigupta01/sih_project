const { inMemoryStore } = require('../config/db');
const { BATCH_STATUS } = require('../config/constants');

// Get list of all approved recyclers (used by collectors to browse best matches)
const getApprovedRecyclers = async (req, res) => {
  try {
    const { category, lat, lng } = req.query;
    let recyclers = inMemoryStore.users
      .filter(u => u.role === 'recycler')
      .map(r => {
        // Calculate simulated distance in km
        const distanceKm = Math.floor(2 + Math.random() * 8);
        const specializes = category ? r.specializedIn?.includes(category) : false;
        const specializationBonus = specializes ? '+10% Mineral Bonus' : 'Standard Rate';

        return {
          id: r._id,
          name: r.companyName || r.name,
          cpcbRegNumber: r.cpcbRegNumber,
          specializedIn: r.specializedIn || [],
          serviceArea: r.serviceArea,
          location: r.location,
          distanceKm,
          rating: 4.8,
          isApprovedGovt: true,
          specializationBonus,
          acceptsInstantOtp: true,
          phone: r.phone
        };
      });

    // Sort by specialization first, then distance
    if (category) {
      recyclers.sort((a, b) => {
        const aSpec = a.specializedIn.includes(category) ? 1 : 0;
        const bSpec = b.specializedIn.includes(category) ? 1 : 0;
        return bSpec - aSpec || a.distanceKm - b.distanceKm;
      });
    }

    return res.json({
      success: true,
      recyclers
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Recycler Dashboard: Get incoming batches ready for pickup / verification
const getIncomingBatches = async (req, res) => {
  try {
    const recycler = req.user;
    // Show batches matched to this recycler or unassigned active batches
    const batches = inMemoryStore.batches.filter(
      b => b.assignedRecyclerId === recycler._id || b.status === BATCH_STATUS.MATCHED || b.status === BATCH_STATUS.POOLED || b.status === BATCH_STATUS.PENDING_VERIFICATION
    );

    // Calculate metrics for this recycler
    const completedBatches = inMemoryStore.batches.filter(
      b => b.assignedRecyclerId === recycler._id && b.status === BATCH_STATUS.COMPLETED
    );

    const totalIntakeKg = completedBatches.reduce((acc, b) => acc + (b.weightKg || 0), 0);
    const totalPayoutINR = completedBatches.reduce((acc, b) => acc + (b.grandTotal || b.totalAgreedPrice || 0), 0);

    return res.json({
      success: true,
      batches,
      metrics: {
        totalIntakeKg: Math.round(totalIntakeKg * 10) / 10,
        totalPayoutINR,
        completedCount: completedBatches.length,
        pendingCount: batches.filter(b => b.status !== BATCH_STATUS.COMPLETED).length
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update CPCB registration & verification status
const updateRecyclerProfile = async (req, res) => {
  try {
    const recycler = req.user;
    const { companyName, cpcbRegNumber, specializedIn, serviceArea } = req.body;

    if (companyName) recycler.companyName = companyName;
    if (cpcbRegNumber) recycler.cpcbRegNumber = cpcbRegNumber;
    if (specializedIn) recycler.specializedIn = specializedIn;
    if (serviceArea) recycler.serviceArea = serviceArea;

    return res.json({
      success: true,
      message: 'Recycler compliance profile updated successfully.',
      recycler
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getApprovedRecyclers,
  getIncomingBatches,
  updateRecyclerProfile
};
