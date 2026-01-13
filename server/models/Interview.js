const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    round: {
        type: String,
        required: [true, 'Please add interview round'],
        enum: ['Phone Screen', 'Technical', 'Behavioral', 'System Design', 'HR Round', 'Final Round', 'Other']
    },
    interviewDate: {
        type: Date,
        required: [true, 'Please add interview date']
    },
    duration: {
        type: Number, // in minutes
        default: 60
    },
    interviewType: {
        type: String,
        enum: ['Phone', 'Video', 'In-Person', 'On-Site'],
        default: 'Video'
    },
    interviewer: {
        name: String,
        title: String,
        email: String
    },
    location: {
        type: String // Meeting link or physical location
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
        default: 'Scheduled'
    },
    outcome: {
        type: String,
        enum: ['Passed', 'Failed', 'Pending', 'N/A'],
        default: 'Pending'
    },
    notes: {
        type: String
    },
    feedback: {
        type: String
    },
    preparation: {
        checklist: [{
            task: String,
            completed: Boolean,
            createdAt: { type: Date, default: Date.now }
        }],
        resources: [String]
    },
    reminder: {
        enabled: Boolean,
        reminderTime: Number // minutes before interview
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);