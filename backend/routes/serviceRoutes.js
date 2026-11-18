const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/', serviceController.getAllServices);
router.post('/', serviceController.addService);
router.patch('/:id/price', serviceController.updateServicePrice);

module.exports = router;
