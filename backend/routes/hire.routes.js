const express = require('express');
const router = express.Router();
const hireController = require('../controllers/hire.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// Protect all hire routes with auth and admin role check
router.use(authMiddleware, adminMiddleware);

router.post('/jobs', hireController.postJobController);
router.get('/jobs/:id/apps', hireController.getApplicantsController);
router.patch('/apps/:id', hireController.updateApplicationStatusController);

module.exports = router;
