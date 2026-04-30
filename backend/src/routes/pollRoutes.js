const router = require('express').Router();
const pollController = require('../controllers/pollController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/active', authMiddleware, pollController.getActivePoll);

router.post('/vote', authMiddleware, pollController.votePoll);

module.exports = router;