const express = require('express');
const userController = require('../controllers/user');
const passportConfig = require('../config/passport');

const router = express.Router();

router.get('/settings', passportConfig.isAuthenticated, userController.getSettings);
router.post('/settings/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
router.post('/settings/profile/developer', passportConfig.isAuthenticated, userController.postUpdateProfileDeveloper);
router.post('/settings/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
router.post('/settings/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
router.get('/settings/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

module.exports = router;

