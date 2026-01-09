const router = require('express').Router();
const { getAllEvents, createEvent, joinEvent, getMyEvents, deleteEvent } = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware'); 


router.get('/', getAllEvents);

router.post('/', authMiddleware, createEvent);

router.post('/:id/join', authMiddleware, joinEvent);

router.get('/my-events', authMiddleware, getMyEvents);

router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router;

