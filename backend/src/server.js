const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/dbConfig');
const { loadEnvVariables, validateEnvVariables } = require('./config/envConfig');
const { requestLogger, errorLogger } = require('./utils/logger');

// Routes
const appointmentRoutes = require('./routes/appointmentRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const careOrchestrationRoutes = require('./routes/careOrchestrationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const iotRoutes = require('./routes/iotRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');

const app = express();

// Load and validate environment variables
loadEnvVariables();
validateEnvVariables();

// Connect to database
connectDB();

// ✅ ADDED: Global rate limiter to protect all endpoints
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

// ✅ ADDED: Tighter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many authentication attempts.' }
});

// Middleware
app.use(helmet({
    // ✅ ADDED: Content-Security-Policy for API server
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(globalLimiter);
app.use(requestLogger);

// Health check (no auth required)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'U_C_H Enterprise API',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// Routes
// ✅ FIX: original server.js only registered /appointments and /users — all other routes were missing
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/care', careOrchestrationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/monitoring', monitoringRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error logging middleware
app.use(errorLogger);

// ✅ FIX: original global error handler was missing `next` parameter — Express requires all 4 args
// for error-handling middleware, otherwise it's treated as a regular middleware and skipped
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// ✅ ADDED: graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

module.exports = app; // Export for testing
