const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const MONGO_URI =
	process.env.MONGO_URI ||
	'mongodb+srv://nguyentiendat098:NguyenTienDat098@cluster0.rv7ojc4.mongodb.net/dashboardp2';

// MongoDB connection with better error handling
mongoose
	.connect(MONGO_URI, {
		maxPoolSize: 10,
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
	})
	.then(() => console.log('Connected to MongoDB'))
	.catch((err) => {
		console.error('MongoDB connection error:', err);
		// Don't exit in serverless environment
	});

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

// Static files
app.use('/dashboard', express.static(path.join(__dirname, '../src/view')));

// Routes (mount at root because this function is served under /api on Vercel)
const productRoutes = require('../src/routes/product.routes');
const searchUrlRoutes = require('../src/routes/searchUrl.routes');
const crawlerIntegrationRoutes = require('../src/routes/crawlerIntegration.routes');
const referralFeeRuleRoutes = require('../src/routes/referralFeeRule.routes');
const fbaFeeRuleRoutes = require('../src/routes/fbaFeeRule.routes');
const sizeTierRuleRoutes = require('../src/routes/sizeTierRule.routes');
const filterTemplateRoutes = require('../src/routes/filterTemplate.routes');
app.use('/', productRoutes); // -> /api/products, etc.
app.use('/search-urls', searchUrlRoutes); // -> /api/search-urls
app.use('/crawler', crawlerIntegrationRoutes); // -> /api/crawler
app.use('/', referralFeeRuleRoutes); // -> /api/fba-fee-rules, /api/fee-rules
app.use('/', fbaFeeRuleRoutes);
app.use('/size-tier-rules', sizeTierRuleRoutes);
app.use('/filter-templates', filterTemplateRoutes);

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
