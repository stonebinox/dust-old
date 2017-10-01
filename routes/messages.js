const express = require('express');
const messagesController = require('../controllers/messages');
const passportConfig = require('../config/passport');

const router = express.Router();

router.get('/messages', passportConfig.isAuthenticated, messagesController.index);
router.get('/messages/:conversationId', passportConfig.isAuthenticated, messagesController.message);
router.post('/api/conversation/:recipient', passportConfig.isAuthenticated, messagesController.createConversation);
router.post('/api/conversation/:conversationId/reply', passportConfig.isAuthenticated, messagesController.reply);

module.exports = router;
