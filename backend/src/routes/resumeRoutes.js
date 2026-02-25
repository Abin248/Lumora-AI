const express = require('express');
const { uploadResume, getResumes, getResumeById, deleteResume, analyzeResume, optimizeResume, createManualResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/manual', protect, createManualResume);
router.post('/analyze', protect, analyzeResume);
router.post('/optimize', protect, optimizeResume);
router.get('/', protect, getResumes);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);

module.exports = router;
