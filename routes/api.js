const express = require('express');
const apiController = require('../controllers/api');

const router = express.Router();

router.get('/developers', apiController.getAllUsers);

module.exports = router;
