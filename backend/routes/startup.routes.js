const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const {
  createStartup,
  getMyStartup
} = require('../controllers/startup.controller');

router.post('/', authMiddleware, createStartup);
router.get('/me', authMiddleware, getMyStartup);

module.exports = router;
