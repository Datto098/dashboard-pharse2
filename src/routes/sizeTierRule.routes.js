const express = require('express');
const router = express.Router();
const multer = require('multer');

// Use memory storage for serverless environment
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const ctrl = require('../controllers/sizeTierRule.controller');

router.get('/', ctrl.getAllRules);
router.get('/:id', ctrl.getRuleById);
router.post('/', express.json(), ctrl.createRule);
router.put('/:id', express.json(), ctrl.updateRule);
router.delete('/:id', ctrl.deleteRule);
router.delete('/', ctrl.deleteAllRules);
router.post('/import', upload.single('file'), ctrl.importFromExcel);

module.exports = router;
