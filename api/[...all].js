const app = require('./index');

// Normalize Vercel dynamic route so Express sees clean paths
module.exports = (req, res) => {
	try {
		const originalUrl = req.url || '/';
		// Strip leading /api so Express mounted at root matches
		let pathname = originalUrl.replace(/^\/api(\/|$)/, '/');
		// Remove the extra `all` query param that Vercel adds for [...all]
		const url = new URL(pathname, 'http://localhost');
		url.searchParams.delete('all');
		req.url = url.pathname + (url.search ? url.search : '');
	} catch (e) {
		// Fallback: keep original req.url
	}
	return app(req, res);
};
