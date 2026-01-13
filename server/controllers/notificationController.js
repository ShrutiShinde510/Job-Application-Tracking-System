const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        console.log(`🔔 Fetching notifications for user: ${req.user._id}`);
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        console.log(`✅ Found ${notifications.length} notifications`);

        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            res.status(404);
            throw new Error('Notification not found');
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            res.status(404);
            throw new Error('Notification not found');
        }

        await notification.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Notification removed'
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to create notification
exports.createNotification = async (userId, data) => {
    try {
        await Notification.create({
            user: userId,
            ...data
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
