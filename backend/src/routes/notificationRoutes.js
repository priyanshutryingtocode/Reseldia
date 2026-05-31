const router = require('express').Router();
const controller = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, controller.getNotifications);
router.put('/read', authMiddleware, controller.markNotificationsRead);

module.exports = router;
