const router = require('express').Router();
const { 
    getAllEvents, 
    createEvent, 
    joinEvent, 
    getMyEvents, 
    deleteEvent,
    getPendingEvents, 
    approveEvent,
    getMyCreatedEvents,
    getEventComments,  
    postComment,       
    getEventAttendees  
} = require('../controllers/eventController');

const authMiddleware = require('../middleware/authMiddleware'); 
const adminMiddleware = require('../middleware/adminMiddleware'); 

// Public
router.get('/', getAllEvents); 

// Admin
router.get('/pending', authMiddleware, adminMiddleware, getPendingEvents);
router.put('/approve/:id', authMiddleware, adminMiddleware, approveEvent);

// General User
router.post('/', authMiddleware, createEvent); 
router.post('/:id/join', authMiddleware, joinEvent);
router.get('/my-events', authMiddleware, getMyEvents);
router.delete('/:id', authMiddleware, deleteEvent);
router.get('/created-by-me', authMiddleware, getMyCreatedEvents);


router.get('/:id/comments', authMiddleware, getEventComments);
router.post('/:id/comments', authMiddleware, postComment);
router.get('/:id/attendees', authMiddleware, getEventAttendees);

module.exports = router;