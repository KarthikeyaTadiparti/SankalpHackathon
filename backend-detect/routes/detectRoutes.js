const express = require('express');
const router = express.Router();
const { detectDarkPatternsController } = require('../controllers/detectController');

// POST /api/detect
router.post('/', detectDarkPatternsController);

module.exports = router;
