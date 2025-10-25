// Main server file

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { success } = require('zod');
require('dotenv').config();
const mongoose = require('mongoose');

// Check for required environment variables
if (!process.env.MONGO_URI) {
    console.error("ERROR: Please specify MONGO_URI in env file");
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error("ERROR: Please specify JWT_SECRET in env file");
    process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

const app = express();

const PORT = process.env.PORT || console.error("ERROR: Please specify PORT in env file");

// Middleware

// Security headers
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.NODE_ENV === "production"
        ? ['http://localhost:3000']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));

// Request logging
app.use(morgan('combined'));

// JSON body parsing
app.use(express.json({limit: '10mb'}));

// URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/v1', require('./src/routes'));

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
})

// Global error handler
app.use((err, req, res, next) => {
    console.error("ERROR: ", err.message);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack1})
    });
});

// Shutdown
process.on('SIGTERM', () => {
    console.log("SIGTERM received. Shutting down...");
});

// Start server
app.listen(PORT, () => {
    console.log(`Starting server on ${PORT} ...`);
});