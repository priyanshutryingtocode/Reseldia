const router = require('express').Router();
const { 
    getAllEvents, 
    createEvent, 
    getEventById,
    updateEvent,
    joinEvent, 
    getMyEvents, 
    deleteEvent,
    getPendingEvents, 
    approveEvent,
    rejectEvent,
    cancelEvent,
    completeEvent,
    getMyCreatedEvents,
    getEventComments,  
    postComment,       
    getEventAttendees,
    toggleBookmark,
    getBookmarkedEvents,
    getMyStats
} = require('../controllers/eventController');

const authMiddleware = require('../middleware/authMiddleware'); 
const adminMiddleware = require('../middleware/adminMiddleware'); 

// Public-ish listing; auth is optional in the controller shape, but the app sends auth.
router.get('/', authMiddleware, getAllEvents);

// Admin
router.get('/pending', authMiddleware, adminMiddleware, getPendingEvents);
router.put('/approve/:id', authMiddleware, adminMiddleware, approveEvent);
router.put('/reject/:id', authMiddleware, adminMiddleware, rejectEvent);

// General User
router.post('/', authMiddleware, createEvent); 
router.get('/my-events', authMiddleware, getMyEvents);
router.get('/created-by-me', authMiddleware, getMyCreatedEvents);
router.get('/bookmarked', authMiddleware, getBookmarkedEvents);
router.get('/stats/me', authMiddleware, getMyStats);
router.post('/:id/join', authMiddleware, joinEvent);
router.post('/:id/bookmark', authMiddleware, toggleBookmark);
router.get('/:id/comments', authMiddleware, getEventComments);
router.post('/:id/comments', authMiddleware, postComment);
router.get('/:id/attendees', authMiddleware, getEventAttendees);
router.put('/:id/cancel', authMiddleware, cancelEvent);
router.put('/:id/complete', authMiddleware, completeEvent);
router.put('/:id', authMiddleware, updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);
router.get('/:id', authMiddleware, getEventById);

module.exports = router;
