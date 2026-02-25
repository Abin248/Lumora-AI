const express = require('express');
const { chatInterview, getInterview } = require('../controllers/interviewController');
const { startSpeechTest, processSpeechAnswer, generateSpeechReport } = require('../controllers/SpeechTestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/chat', protect, chatInterview);
router.get('/:id', protect, getInterview);

// Speech Test Routes
router.post('/speech/start', protect, startSpeechTest);
router.post('/speech/answer', protect, processSpeechAnswer);
router.post('/speech/report', protect, generateSpeechReport);

module.exports = router;
