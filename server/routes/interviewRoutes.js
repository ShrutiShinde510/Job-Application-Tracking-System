const express = require('express');
const router = express.Router();
const {
    getInterviews,
    getInterviewsByApplication,
    getInterview,
    createInterview,
    updateInterview,
    deleteInterview,
    updatePreparation
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Main routes
router.route('/')
    .get(getInterviews)
    .post(createInterview);

// Application-specific interviews
router.get('/application/:applicationId', getInterviewsByApplication);

// Single interview routes
router.route('/:id')
    .get(getInterview)
    .put(updateInterview)
    .delete(deleteInterview);

// Preparation checklist
router.put('/:id/preparation', updatePreparation);

module.exports = router;