const express = require('express');
const router = express.Router();
const {
    getApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    getStats
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Stats route (must be before /:id route)
router.get('/stats', getStats);

// Main routes
router.route('/')
    .get(getApplications)
    .post(createApplication);

router.route('/:id')
    .get(getApplication)
    .put(updateApplication)
    .delete(deleteApplication);

module.exports = router;