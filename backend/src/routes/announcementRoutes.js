const router = require('express').Router();
const controller = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', authMiddleware, controller.getActiveAnnouncements);
router.get('/all', authMiddleware, adminMiddleware, controller.getAllAnnouncements);
router.post('/', authMiddleware, adminMiddleware, controller.createAnnouncement);
router.put('/:id', authMiddleware, adminMiddleware, controller.updateAnnouncement);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deleteAnnouncement);

module.exports = router;
