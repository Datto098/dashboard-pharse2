const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const MONGO_URI =
	process.env.MONGO_URI ||
	'mongodb+srv://nguyentiendat098:NguyenTienDat098@cluster0.rv7ojc4.mongodb.net/dashboardp2';

// MongoDB connection with better error handling and lazy ensure
const mongooseOptions = {
	maxPoolSize: 10,
	serverSelectionTimeoutMS: 30000,
	socketTimeoutMS: 60000,
};

let connectPromise = null;

async function ensureDbConnected() {
	if (mongoose.connection.readyState === 1) return; // already connected
	if (!connectPromise) {
		connectPromise = mongoose
			.connect(MONGO_URI, mongooseOptions)
			.then(() => {
				console.log('Connected to MongoDB');
				return mongoose.connection;
			});
	}
	return connectPromise;
}

const app = express();

// Middleware
app.use(
	cors({
		origin: process.env.FRONTEND_URL || '*',
		credentials: true,
	})
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure DB connection for every request (no-op if already connected)
app.use(async (req, res, next) => {
	try {
		await ensureDbConnected();
		return next();
	} catch (err) {
		console.error('Failed to connect to MongoDB for request:', err);
		return res.status(500).json({ error: 'DB_CONNECT_ERROR' });
	}
});

// Static files
app.use('/dashboard', express.static(path.join(__dirname, '../src/view')));

// Routes: mount under /api because rewrites forward /api/* to this handler keeping the path
const productRoutes = require('../src/routes/product.routes');
const searchUrlRoutes = require('../src/routes/searchUrl.routes');
const crawlerIntegrationRoutes = require('../src/routes/crawlerIntegration.routes');
const referralFeeRuleRoutes = require('../src/routes/referralFeeRule.routes');
const fbaFeeRuleRoutes = require('../src/routes/fbaFeeRule.routes');
const sizeTierRuleRoutes = require('../src/routes/sizeTierRule.routes');
const filterTemplateRoutes = require('../src/routes/filterTemplate.routes');
app.use('/api', productRoutes);
app.use('/api/search-urls', searchUrlRoutes);
app.use('/api/crawler', crawlerIntegrationRoutes);
app.use('/api', referralFeeRuleRoutes);
app.use('/api', fbaFeeRuleRoutes);
app.use('/api/size-tier-rules', sizeTierRuleRoutes);
app.use('/api/filter-templates', filterTemplateRoutes);

// Health check endpoint
app.get('/', (req, res) => {
	res.json({
		message: 'Amazon Product Dashboard API',
		status: 'running',
		version: '1.0.0',
		timestamp: new Date().toISOString(),
	});
});

// Config endpoint
app.get('/api/config', (req, res) => {
	res.json({
		API_BASE_URL: process.env.API_BASE_URL || '',
		CRAWLER_API_ENDPOINT: process.env.CRAWLER_API_ENDPOINT || '',
		ENVIRONMENT: process.env.NODE_ENV || 'development',
	});
});

// Global error handler
app.use((err, req, res, next) => {
	console.error('Global error handler:', err);
	res.status(500).json({
		error: 'Internal Server Error',
		message:
			process.env.NODE_ENV === 'development'
				? err.message
				: 'Something went wrong',
	});
});

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({
		error: 'Not Found',
		message: `Route ${req.originalUrl} not found`,
	});
});

// Initialize default templates on startup (only in serverless environment)
const filterTemplateService = require('../src/services/filterTemplate.service');

// Initialize default filter templates
(async () => {
	try {
		await filterTemplateService.createDefaultTemplates();
		console.log('✅ Default filter templates initialized');
	} catch (error) {
		console.log('⚠️  Default templates already exist or error occurred');
	}
})();

module.exports = app;
