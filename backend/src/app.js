const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const careerRoutes = require('./routes/careerRoutes');
const interviewRoutes = require('./routes/interviewRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/interview', interviewRoutes);

// Static folder for uploads (optional/if needed for direct access)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = app;
