const db = require('../config/db');

exports.getAllProviders = (req, res) => {
  try {
    const providers = db.getProviders();
    res.status(200).json({ success: true, count: providers.length, data: providers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.registerProvider = (req, res) => {
  try {
    const { name, phone, serviceCategory, experienceYears, location, bio } = req.body;
    if (!name || !phone || !serviceCategory) {
      return res.status(400).json({ success: false, error: 'Name, phone, and serviceCategory are required.' });
    }
    const created = db.addProvider({
      name,
      phone,
      serviceCategory,
      experienceYears: Number(experienceYears) || 1,
      location: location || 'Delhi NCR',
      bio: bio || 'Professional technician'
    });
    res.status(201).json({ success: true, message: 'Registration submitted. KYC pending review.', data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateDutyStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = db.updateProviderStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Provider not found.' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
