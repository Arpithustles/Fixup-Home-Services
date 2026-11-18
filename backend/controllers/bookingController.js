const db = require('../config/db');

exports.getAllBookings = (req, res) => {
  try {
    const bookings = db.getBookings();
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createBooking = (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, serviceId, serviceName, category, date, timeSlot, isEmergency, totalAmount, notes } = req.body;

    if (!customerName || !customerPhone || !customerAddress || !serviceName) {
      return res.status(400).json({ success: false, error: 'Customer contact, address, and service details are required.' });
    }

    // Auto match available online provider if not supplied
    const matchedPro = db.getProviders().find(
      p => p.serviceCategory.toLowerCase() === (category || '').toLowerCase() && p.status === 'online' && p.kycStatus === 'verified'
    );

    const booking = db.createBooking({
      customerName,
      customerPhone,
      customerAddress,
      serviceId,
      serviceName,
      category,
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || 'Immediate',
      isEmergency: Boolean(isEmergency),
      totalAmount: Number(totalAmount) || 499,
      notes: notes || '',
      providerId: matchedPro ? matchedPro.id : null,
      providerName: matchedPro ? matchedPro.name : 'Matching Soon'
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.updateBookingStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.assignProvider = (req, res) => {
  try {
    const { id } = req.params;
    const { providerId } = req.body;
    const updated = db.assignProvider(id, providerId);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking or Provider not found.' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
