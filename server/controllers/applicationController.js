const Application = require('../models/Application');
const { createNotification } = require('./notificationController');

// @desc    Get all applications for logged in user
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({ user: req.user._id })
            .sort({ appliedDate: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplication = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            res.status(404);
            throw new Error('Application not found');
        }

        // Make sure user owns the application
        if (application.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        res.status(200).json({
            success: true,
            application
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res, next) => {
    try {
        const { company, position, location, salary, jobType, status, appliedDate, jobUrl, notes, logo } = req.body;

        // Validation
        if (!company || !position) {
            res.status(400);
            throw new Error('Please provide company and position');
        }

        const application = await Application.create({
            user: req.user._id,
            company,
            position,
            location,
            salary,
            jobType,
            status,
            appliedDate,
            jobUrl,
            notes,
            logo
        });

        // Create notification
        await createNotification(req.user._id, {
            type: 'system',
            title: 'New Application Added',
            message: `You started a new application for ${position} at ${company}`,
            company: company,
            priority: 'low'
        });

        res.status(201).json({
            success: true,
            application
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res, next) => {
    try {
        let application = await Application.findById(req.params.id);

        if (!application) {
            res.status(404);
            throw new Error('Application not found');
        }

        // Make sure user owns the application
        if (application.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        const oldStatus = application.status;

        application = await Application.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        // Create notification if status changed
        if (req.body.status && req.body.status !== oldStatus) {
            await createNotification(req.user._id, {
                type: 'status',
                title: 'Application Status Updated',
                message: `Your application for ${application.position} at ${application.company} moved to "${application.status}"`,
                company: application.company,
                priority: application.status === 'Offer' ? 'high' : 'medium'
            });
        }

        res.status(200).json({
            success: true,
            application
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res, next) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            res.status(404);
            throw new Error('Application not found');
        }

        // Make sure user owns the application
        if (application.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        await application.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get application statistics
// @route   GET /api/applications/stats
// @access  Private
const getStats = async (req, res, next) => {
    try {
        const applications = await Application.find({ user: req.user._id });

        const stats = {
            totalApplications: applications.length,
            activeApplications: applications.filter(app =>
                app.status === 'Applied' || app.status === 'Interview'
            ).length,
            interviews: applications.filter(app => app.status === 'Interview').length,
            offers: applications.filter(app => app.status === 'Offer').length,
            rejected: applications.filter(app => app.status === 'Rejected').length,
            wishlist: applications.filter(app => app.status === 'Wishlist').length
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    getStats
};
