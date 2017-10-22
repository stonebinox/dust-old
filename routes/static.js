const express = require('express');
const staticController = require('../controllers/static');

const router = express.Router();

router.get('/', staticController.index);
router.get('/home', staticController.home);
router.get('/about', staticController.about);
router.get('/terms', staticController.terms);
router.get('/featured_developers', staticController.featured_developers);
router.get('/mvps', staticController.mvps);
router.get('/help', staticController.help);
router.get('/resources', staticController.resources);

module.exports = router;
