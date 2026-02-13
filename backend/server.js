const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database
const db = require('./config/db');

// Import middleware
const { sanitizeBody } = require('./middleware/validate');

// Import routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import cron jobs
const { startReminderCron } = require('./services/reminderCron');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Sanitize all request bodies
app.use(sanitizeBody);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Doctor Appointment Booking System API is running',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 5MB limit.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🏥 Doctor Appointment Booking System`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}\n`);

    // Start cron jobs
    startReminderCron();
});

module.exports = app;
