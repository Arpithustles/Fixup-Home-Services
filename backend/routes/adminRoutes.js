const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/metrics', adminController.getMetrics);
router.patch('/providers/:id/kyc', adminController.updateProviderKyc);

module.exports = router;
