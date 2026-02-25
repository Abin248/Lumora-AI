const Resume = require('../models/Resume');
const fs = require('fs');
const { extractTextFromPDF } = require('../services/pdfService');
const { parseResumeWithAI } = require('../services/aiService');
const { calculateATSScore } = require('../services/atsService');
const { generateOptimizedResume } = require('../services/optimizeService');

// @desc    Upload and process resume
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;

        // 1. Extract Text
        const extractedText = await extractTextFromPDF(filePath);

        // 2. Parse with AI
        const parsedData = await parseResumeWithAI(extractedText);

        // Get JD from body
        const { jobDescription } = req.body;

        // 3. ATS Score with JD context
        const atsResult = await calculateATSScore(parsedData, jobDescription);

        // 4. Save to DB
        const resume = await Resume.create({
            user: req.user._id,
            fileName: req.file.originalname,
            filePath: filePath,
            extractedText,
            jobDescription: jobDescription || "",
            // Map flat fields
            personalInfo: parsedData.personalInfo,
            summary: parsedData.summary,
            skills: parsedData.skills,
            experiences: parsedData.experiences,
            education: parsedData.education,
            projects: parsedData.projects,
            certifications: parsedData.certifications,
            achievements: parsedData.achievements,
            activities: parsedData.activities,
            volunteering: parsedData.volunteering,
            workshops: parsedData.workshops,

            atsScore: atsResult.atsScore || 0,
            atsFeedback: atsResult.atsFeedback || "No feedback generated",
        });
        res.status(201).json(resume);

    } catch (error) {
        console.error(error);
        // Cleanup file if error
        if (req.file && fs.existsSync(req.file.path)) {
            // fs.unlinkSync(req.file.path); // Optional: keep for debug
        }
        res.status(500).json({ message: 'Resume processing failed', error: error.message });
    }
};

// @desc    Create manual resume
// @route   POST /api/resume/manual
// @access  Private
const createManualResume = async (req, res) => {
    try {
        // ✅ FIX: destructure 'references' from req.body
        const { personalInfo, summary, skills, experiences, education, projects, certifications, achievements, activities, volunteering, workshops, references, jobDescription } = req.body;

        const resume = await Resume.create({
            user: req.user._id,
            fileName: `${personalInfo?.fullName || 'User'}_Resume.pdf`, // Placeholder name
            filePath: "manual_build", // Placeholder until PDF generation
            extractedText: "Manual Entry",
            jobDescription: jobDescription || "",
            personalInfo,
            summary,
            skills,
            experiences,
            education,
            projects,
            certifications,
            achievements,
            activities,
            volunteering,
            workshops,
            references,          // ✅ now references is passed to the model
            atsScore: 0,
            atsFeedback: "Created manually",
        });

        res.status(201).json(resume);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create resume', error: error.message });
    }
};

// @desc    Get user resumes
// @route   GET /api/resume
// @access  Private
const getResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(resumes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific resume
// @route   GET /api/resume/:id
// @access  Private
const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (resume && resume.user.equals(req.user._id)) {
            res.json(resume);
        } else {
            res.status(404).json({ message: 'Resume not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete resume
// @route   DELETE /api/resume/:id
// @access  Private
const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Check user
        if (!resume.user.equals(req.user._id)) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Remove file from filesystem
        if (fs.existsSync(resume.filePath)) {
            fs.unlinkSync(resume.filePath);
        }

        await resume.deleteOne();

        res.json({ message: 'Resume removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Re-analyze existing resume with new JD (No Save)
// @route   POST /api/resume/analyze
// @access  Private
const analyzeResume = async (req, res) => {
    try {
        const { resumeId, jobDescription } = req.body;

        if (!resumeId) {
            return res.status(400).json({ message: 'Resume ID is required' });
        }

        const resume = await Resume.findById(resumeId);

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        // Check user
        if (!resume.user.equals(req.user._id)) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Reconstruct resume data for AI
        const resumeData = {
            personalInfo: resume.personalInfo,
            summary: resume.summary,
            skills: resume.skills,
            experiences: resume.experiences,
            education: resume.education,
            projects: resume.projects,
            certifications: resume.certifications,
            achievements: resume.achievements,
            activities: resume.activities,
            volunteering: resume.volunteering,
            workshops: resume.workshops,
            references: resume.references    // ✅ added for completeness
        };

        // Calculate NEW Score
        const atsResult = await calculateATSScore(resumeData, jobDescription);

        // Return combined result (Ephemeral, not saved)
        const result = {
            ...resume.toObject(),
            atsScore: atsResult.atsScore,
            atsFeedback: atsResult.atsFeedback,
            jobDescription: jobDescription // Return the new JD too
        };

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Analysis failed', error: error.message });
    }
};

// @desc    Generate optimized resume JSON (No Save)
// @route   POST /api/resume/optimize
// @access  Private
const optimizeResume = async (req, res) => {
    try {
        console.log(">>> [Backend] Optimize Resume Request Received");
        const { resumeId, jobDescription } = req.body;
        console.log(">>> [Backend] Payload:", { resumeId, jobDescriptionLength: jobDescription ? jobDescription.length : 0 });

        if (!resumeId) {
            console.log(">>> [Backend] Missing resumeId");
            return res.status(400).json({ message: 'Resume ID is required' });
        }

        const resume = await Resume.findById(resumeId);

        if (!resume) {
            console.log(">>> [Backend] Resume not found for ID:", resumeId);
            return res.status(404).json({ message: 'Resume not found' });
        }

        if (!resume.user.equals(req.user._id)) {
            console.log(">>> [Backend] Unauthorized access attempt by user:", req.user._id);
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Determine Job Description: Use provided one OR fallback to DB stored one
        const targetJD = jobDescription || resume.jobDescription;

        if (!targetJD) {
            console.log(">>> [Backend] No Job Description found in body or DB");
            return res.status(400).json({ message: 'Job Description is required (provide in body or must be saved in resume)' });
        }

        console.log(">>> [Backend] Preparing data for AI service...");

        // Prepare data for AI
        const resumeData = {
            personalInfo: resume.personalInfo,
            summary: resume.summary,
            skills: resume.skills,
            experiences: resume.experiences,
            education: resume.education,
            projects: resume.projects,
            certifications: resume.certifications,
            achievements: resume.achievements,
            activities: resume.activities,
            volunteering: resume.volunteering,
            workshops: resume.workshops,
            references: resume.references    // ✅ added for completeness
        };

        // Call AI Service
        console.log(">>> [Backend] Calling generateOptimizedResume...");
        const optimizedData = await generateOptimizedResume(resumeData, targetJD);
        console.log(">>> [Backend] Optimized Data received from Service:", Object.keys(optimizedData));

        res.json(optimizedData);

    } catch (error) {
        console.error(">>> [Backend] Optimization Controller Error:", error);
        res.status(500).json({ message: 'Optimization failed' });
    }
};

module.exports = { uploadResume, getResumes, getResumeById, deleteResume, analyzeResume, optimizeResume, createManualResume };