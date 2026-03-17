const ecpress = require('express');
const router = ecpress.Router();
const { protect, admin } = require('../middleware/auth');
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');    



// Get all events   
router.get('/', getAllEvents);

// Get event by id
router.get('/:id', getEventById);   

// Create new event (admin only)
router.post('/', protect, admin, createEvent);

// Update event (admin only)
router.put('/:id', protect, admin, updateEvent);

// Delete event (admin only)
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;


