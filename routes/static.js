const express = require('express');
const staticController = require('../controllers/static');

const router = express.Router();

router.get('/', staticController.index);
router.get('/about', staticController.about);
router.get('/terms', staticController.terms);

module.exports = router;
