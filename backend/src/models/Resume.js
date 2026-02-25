const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    fileName: {
        type: String,
        required: false,
        default: "Manual Resume"
    },
    filePath: {
        type: String,
        required: false,
        default: "manual_entry"
    },
    extractedText: {
        type: String,
    },
    jobDescription: {
        type: String,
        default: "",
    },
    personalInfo: {
        fullName: String,
        title: String, 
        email: String,
        phone: String,
        linkedin: String,
        github: String,
    },
    summary: String,
    skills: [String],
    experiences: [{
        jobTitle: String,
        company: String,
        startDate: String,
        endDate: String,
        description: String,
    }],
    education: [{
        degree: String,
        institution: String,
        year: String,
        score: String,
    }],
    projects: [{
        title: String,
        description: String,
        techStack: [String],
    }],
    certifications: [{
        name: String,
        issuer: String,
        issueDate: String,
        expDate: String,
        credId: String,
        url: String,
        description: String
    }],
    achievements: [{
        title: String,
        organization: String,
        date: String,
        description: String
    }],
    activities: [{
        activity: String,
        role: String,
        organization: String,
        startDate: String,
        endDate: String,
        description: String
    }],
    volunteering: [{
        role: String,
        organization: String,
        startDate: String,
        endDate: String,
        description: String
    }],
    workshops: [{
        title: String,
        organization: String,
        startDate: String,
        endDate: String,
        role: String,
        description: String
    }],
    references: [{
        name: { type: String, default: '' },
        jobTitle: { type: String, default: '' },
        company: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        relationship: { type: String, default: '' }
    }],
    atsScore: {
        type: Number,
        default: 0,
    },
    atsFeedback: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;