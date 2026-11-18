const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/', bookingController.getAllBookings);
router.post('/', bookingController.createBooking);
router.patch('/:id/status', bookingController.updateStatus);
router.patch('/:id/assign', bookingController.assignProvider);

module.exports = router;
