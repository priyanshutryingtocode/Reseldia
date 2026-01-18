const router = require('express').Router();
const { 
    getAllEvents, 
    createEvent, 
    joinEvent, 
    getMyEvents, 
    deleteEvent,
    getPendingEvents, 
    approveEvent,
    getMyCreatedEvents  
} = require('../controllers/eventController');


const authMiddleware = require('../middleware/authMiddleware'); 


const adminMiddleware = require('../middleware/adminMiddleware'); 


router.get('/', getAllEvents); 

router.get('/pending', authMiddleware, adminMiddleware, getPendingEvents);

router.put('/approve/:id', authMiddleware, adminMiddleware, approveEvent);

router.post('/', authMiddleware, createEvent); 

router.post('/:id/join', authMiddleware, joinEvent);

router.get('/my-events', authMiddleware, getMyEvents);

router.delete('/:id', authMiddleware, deleteEvent);

router.get('/created-by-me', authMiddleware, getMyCreatedEvents);


module.exports = router;