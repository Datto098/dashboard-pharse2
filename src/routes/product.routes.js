const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Validate Mongo ObjectId to avoid catching named routes like 'count'
const validateObjectId = (req, res, next) => {
	const { id } = req.params;
	if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
		return res.status(400).json({ error: 'Invalid ID format' });
	}
	next();
};

// CRUD operations
router.post('/products', productController.createProduct);
router.get('/products', productController.getAllProducts);
router.get('/products/count', productController.getProductsCount);

// Utility endpoints - MUST be before /:id routes
router.get('/products/soldby-list', productController.getUniqueSoldBy);
router.get('/products/category-list', productController.getUniqueCategories);
router.get('/products/source-list', productController.getUniqueSources);

// Test endpoint to check database
router.get('/products/test', async (req, res) => {
	try {
		const productService = require('../services/product.service');
		const allProducts = await productService.getAllProducts();
		res.json({
			totalProducts: allProducts.length,
			sampleProduct: allProducts[0] || null,
			hasSourceField: allProducts.some((p) => p.source !== undefined),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Dangerous operations - should be POST for safety
router.post('/products/delete-all', productController.deleteAllProducts);

// Parameterized routes - MUST be after specific routes
router.get('/products/:id', validateObjectId, productController.getProductById);
router.put('/products/:id', validateObjectId, productController.updateProduct);
router.delete(
	'/products/:id',
	validateObjectId,
	productController.deleteProduct
);

module.exports = router;
