const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/me', authMiddleware, userController.getMyProfile);
router.get('/profile/:id', authMiddleware, userController.getProfileById);
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;
