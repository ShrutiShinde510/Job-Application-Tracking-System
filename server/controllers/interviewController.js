const Interview = require('../models/Interview');
const Application = require('../models/Application');
const { createNotification } = require('./notificationController');

// @desc    Get all interviews for logged in user
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res, next) => {
    try {
        const interviews = await Interview.find({ user: req.user._id })
            .populate('application', 'company position logo')
            .sort({ interviewDate: 1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get interviews for specific application
// @route   GET /api/interviews/application/:applicationId
// @access  Private
const getInterviewsByApplication = async (req, res, next) => {
    try {
        const interviews = await Interview.find({
            user: req.user._id,
            application: req.params.applicationId
        }).sort({ interviewDate: 1 });

        res.status(200).json({
            success: true,
            count: interviews.length,
            interviews
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single interview
// @route   GET /api/interviews/:id
// @access  Private
const getInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id)
            .populate('application', 'company position logo');

        if (!interview) {
            res.status(404);
            throw new Error('Interview not found');
        }

        if (interview.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        res.status(200).json({
            success: true,
            interview
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new interview
// @route   POST /api/interviews
// @access  Private
const createInterview = async (req, res, next) => {
    try {
        const { application, round, interviewDate, duration, interviewType, interviewer, location, notes } = req.body;

        if (!application || !round || !interviewDate) {
            res.status(400);
            throw new Error('Please provide application, round, and interview date');
        }

        // Verify application belongs to user
        const app = await Application.findById(application);
        if (!app || app.user.toString() !== req.user._id.toString()) {
            res.status(404);
            throw new Error('Application not found');
        }

        const interview = await Interview.create({
            user: req.user._id,
            application,
            round,
            interviewDate,
            duration,
            interviewType,
            interviewer,
            location,
            notes
        });

        // Create notification
        console.log(`🔔 Triggering interview notification for user: ${req.user._id}`);
        await createNotification(req.user._id, {
            type: 'interview',
            title: 'Interview Scheduled',
            message: `New ${round} interview scheduled for ${app.position} at ${app.company}`,
            company: app.company,
            priority: 'high',
            link: '/interviews'
        });

        const populatedInterview = await Interview.findById(interview._id)
            .populate('application', 'company position logo');

        res.status(201).json({
            success: true,
            interview: populatedInterview
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private
const updateInterview = async (req, res, next) => {
    try {
        let interview = await Interview.findById(req.params.id);

        if (!interview) {
            res.status(404);
            throw new Error('Interview not found');
        }

        if (interview.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        interview = await Interview.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('application', 'company position logo');

        res.status(200).json({
            success: true,
            interview
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete interview
// @route   DELETE /api/interviews/:id
// @access  Private
const deleteInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            res.status(404);
            throw new Error('Interview not found');
        }

        if (interview.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        await interview.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Interview deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update interview preparation checklist
// @route   PUT /api/interviews/:id/preparation
// @access  Private
const updatePreparation = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            res.status(404);
            throw new Error('Interview not found');
        }

        if (interview.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        interview.preparation = req.body.preparation;
        await interview.save();

        res.status(200).json({
            success: true,
            interview
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getInterviews,
    getInterviewsByApplication,
    getInterview,
    createInterview,
    updateInterview,
    deleteInterview,
    updatePreparation
};
