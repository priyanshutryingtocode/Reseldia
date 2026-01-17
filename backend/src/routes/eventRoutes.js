const router = require('express').Router();
const { 
    getAllEvents, 
    createEvent, 
    joinEvent, 
    getMyEvents, 
    deleteEvent,
    getPendingEvents, 
    approveEvent 
} = require('../controllers/eventController');

// 1. Import your existing Auth Middleware (Checks: "Are you logged in?")
const authMiddleware = require('../middleware/authMiddleware'); 

// 2. Import the new Admin Middleware (Checks: "Are you the boss?")
const adminMiddleware = require('../middleware/adminMiddleware'); 


// --- PUBLIC ROUTES ---
router.get('/', getAllEvents); // Anyone can see approved events


// --- ADMIN ROUTES ---
// Important: Place these BEFORE /:id routes so "pending" isn't read as an ID
router.get('/pending', authMiddleware, adminMiddleware, getPendingEvents);

router.put('/approve/:id', authMiddleware, adminMiddleware, approveEvent);


// --- USER/RESIDENT ROUTES ---

// Create Event
// Logic inside controller handles if it goes to 'approved' or 'pending'
router.post('/', authMiddleware, createEvent); 

// Join Event
router.post('/:id/join', authMiddleware, joinEvent);

// View My Registered Events
router.get('/my-events', authMiddleware, getMyEvents);

// Delete Event
// Logic inside controller handles "Admins delete all, Users delete own"
router.delete('/:id', authMiddleware, deleteEvent);


module.exports = router;