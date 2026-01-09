const router = require('express').Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); 


router.post('/register', registerUser);
router.post('/login', loginUser);    
router.get('/me', authMiddleware, getMe);  

module.exports = router;