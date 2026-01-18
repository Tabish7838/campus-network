const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/me', authMiddleware, userController.getMyProfile);

module.exports = router;
