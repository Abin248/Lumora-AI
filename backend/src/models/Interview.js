const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    jobDescription: {
        type: String,
        required: true,
    },
    conversation: [
        {
            role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    feedback: {
        type: String
    }
}, {
    timestamps: true,
});

const Interview = mongoose.model('Interview', interviewSchema);
module.exports = Interview;
