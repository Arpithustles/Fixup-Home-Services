const db = require('../config/db');

exports.getAllServices = (req, res) => {
  try {
    const services = db.getServices();
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addService = (req, res) => {
  try {
    const { name, category, basePrice, tagline, addons } = req.body;
    if (!name || !category || !basePrice) {
      return res.status(400).json({ success: false, error: 'Name, category and basePrice are required.' });
    }
    const created = db.addService({ name, category, basePrice: Number(basePrice), tagline, addons });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateServicePrice = (req, res) => {
  try {
    const { id } = req.params;
    const { basePrice } = req.body;
    const updated = db.updateServicePrice(id, basePrice);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
