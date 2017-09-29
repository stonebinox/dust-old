const express = require('express');
const staticController = require('../controllers/static');

const StaticRoutes = require('./static');
const AuthRoutes = require('./auth');
const AccountRoutes = require('./account');
const ApiRoutes = require('./api');
const AdminRoutes = require('./admin');

const router = express.Router();

router.use('/', StaticRoutes);
router.use('/', AuthRoutes);
router.use('/', AccountRoutes);
router.use('/', AdminRoutes);
router.use('/api', ApiRoutes);

// 404 Page
router.use(staticController.missingPage);

module.exports = router;
