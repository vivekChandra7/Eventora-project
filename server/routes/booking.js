const   express = require('express');

const router = express.Router();

//placeholder for booking controller functions
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Booking routes are available' });
});
module.exports = router;