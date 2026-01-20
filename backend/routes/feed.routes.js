const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, feedController.getFeedController);
router.post('/', authMiddleware, feedController.createPostController);
router.post('/:id/join', authMiddleware, feedController.joinPostController);

// RESTful aliases aligning with documented API contract
router.get('/posts', authMiddleware, feedController.getFeedController);
router.post('/posts', authMiddleware, feedController.createPostController);
router.post('/posts/:id/collaborate', authMiddleware, feedController.joinPostController);

module.exports = router;
