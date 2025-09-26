const express = require('express');
const router = express.Router();
const controller = require('../controllers/fbaFeeRule.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/fba-fee-rules', controller.createRule);
router.get('/fba-fee-rules', controller.getAllRules);
router.get('/fba-fee-rules/:id', controller.getRuleById);
router.put('/fba-fee-rules/:id', controller.updateRule);
router.delete('/fba-fee-rules/:id', controller.deleteRule);
router.post('/fba-fee-rules/delete-all', controller.deleteAllRules);
router.post(
	'/fba-fee-rules/import',
	upload.single('file'),
	controller.importFromExcel
);

module.exports = router;
