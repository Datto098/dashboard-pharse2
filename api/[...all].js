const app = require('./index');

// Export as a request handler so Vercel Serverless can invoke Express correctly
module.exports = (req, res) => app(req, res);
