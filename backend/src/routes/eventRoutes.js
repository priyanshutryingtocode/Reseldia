const router = require('express').Router();
const { getAllEvents, createEvent, joinEvent } = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware'); 


router.get('/', getAllEvents);

router.post('/', authMiddleware, createEvent);

router.post('/:id/join', authMiddleware, joinEvent);

module.exports = router;

