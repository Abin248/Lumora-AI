const express = require('express');
const { getCourseRecommendations } = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/recommendations', protect, getCourseRecommendations);

module.exports = router;
