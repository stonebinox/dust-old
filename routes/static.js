const express = require('express');
const staticController = require('../controllers/static');

const router = express.Router();

router.get('/', staticController.index);
router.get('/about', staticController.about);
router.get('/terms', staticController.terms);
router.get('/contact', staticController.contact);
router.post('/contact', staticController.postContact);

module.exports = router;
