const express = require('express');
const staticController = require('../controllers/static');

const router = express.Router();

router.get('/', staticController.index);

module.exports = router;
