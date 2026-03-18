const   express = require('express');

const router = express.Router();

const { protect ,admin } = require('../middleware/auth');

const { bookEvent, sendBookingOTP, getUserBookings, confirmBooking, cancelBooking } = require('../controllers/bookingController');

router.post('/', protect, bookEvent);
router.post('/send-otp', protect, sendBookingOTP);
router.get('/', protect, getUserBookings);
router.delete('/:id/confirm', protect, admin, confirmBooking);
router.delete('/:id', protect, cancelBooking);

module.exports = router;