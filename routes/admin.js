const express = require('express');
const adminController = require('../controllers/admin');
const passportConfig = require('../config/passport');
const adminMiddleware = require('../middlewares/isAdmin');

const router = express.Router();

router.get('/admin', passportConfig.isAuthenticated, adminMiddleware.isAdmin, adminController.getAdmin);
router.get('/admin/user/approve/:id', passportConfig.isAuthenticated, adminMiddleware.isAdmin, adminController.approveUser);
router.get('/developers', passportConfig.isAuthenticated, adminMiddleware.isAdmin, adminController.getDevelopers);

module.exports = router;
