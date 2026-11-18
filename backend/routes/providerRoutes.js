const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');

router.get('/', providerController.getAllProviders);
router.post('/register', providerController.registerProvider);
router.patch('/:id/duty', providerController.updateDutyStatus);

module.exports = router;
