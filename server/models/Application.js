const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Please add a position'],
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    salary: {
        type: String,
        trim: true
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
        default: 'Full-time'
    },
    status: {
        type: String,
        enum: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'],
        default: 'Applied'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    jobUrl: {
        type: String,
        trim: true
    },
    notes: {
        type: String
    },
    logo: {
        type: String,
        default: '🏢'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);