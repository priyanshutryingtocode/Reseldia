const router = require('express').Router();
const pollController = require('../controllers/pollController');
const authMiddleware = require('../middleware/authMiddleware');

// Route: GET /api/polls/active
router.get('/active', authMiddleware, pollController.getActivePoll);

// Route: POST /api/polls/vote
router.post('/vote', authMiddleware, pollController.votePoll);

module.exports = router;