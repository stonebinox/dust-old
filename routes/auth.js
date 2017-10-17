const express = require('express');
const userController = require('../controllers/user');

const router = express.Router();

router.get('/log', userController.getLogin);
router.post('/log', userController.postLogin);
router.get('/logout', userController.logout);
router.get('/forgot', userController.getForgot);
router.post('/forgot', userController.postForgot);
router.get('/reset/:token', userController.getReset);
router.post('/reset/:token', userController.postReset);
router.get('/no-signup', userController.getSignup);
router.post('/no-signup', userController.postSignup);
router.post('/founder/signup', userController.postFounderSignup);
router.get('/dev/signup', userController.getDeveloperSignup);
router.post('/dev/signup', userController.postDeveloperSignup);

module.exports = router;

