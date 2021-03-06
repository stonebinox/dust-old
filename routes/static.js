const express = require('express');
const staticController = require('../controllers/static');

const router = express.Router();

router.get('/', staticController.index);
router.get('/home', staticController.home);
router.get('/about', staticController.about);
router.get('/blog', staticController.blog);
router.get('/terms', staticController.terms);
router.get('/featured_developers', staticController.featured_developers);
router.get('/mvps', staticController.mvps);
router.get('/education', staticController.education);
router.get('/enterprise', staticController.enterprise);
router.get('/pay', staticController.getpay);
router.post('/charge', staticController.postpay);

module.exports = router;