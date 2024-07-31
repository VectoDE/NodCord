const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Routen für Chats
router.get('/', chatController.getAllChats);
router.get('/:id', chatController.getChatById);
router.post('/', chatController.createChat);
router.post('/:id/message', chatController.addMessage);
router.delete('/:id', chatController.deleteChat);

module.exports = router;