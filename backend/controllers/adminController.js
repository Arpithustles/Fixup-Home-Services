const db = require('../config/db');

exports.getMetrics = (req, res) => {
  try {
    const bookings = db.getBookings();
    const providers = db.getProviders();

    const gmv = bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const platformCommission = Math.round(gmv * 0.15);
    const pendingKycCount = providers.filter(p => p.kycStatus === 'pending').length;
    const verifiedProsCount = providers.filter(p => p.kycStatus === 'verified').length;
    const activeJobsCount = bookings.filter(b => ['pending', 'assigned', 'enroute', 'in_progress'].includes(b.status)).length;

    res.status(200).json({
      success: true,
      data: {
        gmv,
        platformCommission,
        pendingKycCount,
        verifiedProsCount,
        activeJobsCount,
        totalBookings: bookings.length,
        systemHealth: 'OPERATIONAL_100%',
        serverUptime: process.uptime()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateProviderKyc = (req, res) => {
  try {
    const { id } = req.params;
    const { kycStatus } = req.body; // 'verified', 'pending', 'rejected'
    const updated = db.updateProviderKyc(id, kycStatus);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Provider not found.' });
    }
    res.status(200).json({ success: true, message: `KYC status updated to ${kycStatus}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
