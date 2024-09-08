const Chat = require('../../models/chatModel');
const logger = require('../services/loggerService');

// TODO: Function Controller

exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find();
    res.status(200).json(chats);
  } catch (error) {
    logger.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

exports.getChatById = async (req, res) => {
  const { id } = req.params;

  try {
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(200).json(chat);
  } catch (error) {
    logger.error(`Error fetching chat with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
};

exports.createChat = async (req, res) => {
  const { participants, messages, type } = req.body;

  try {
    const chat = new Chat({
      participants,
      messages,
      type,
    });

    const newChat = await chat.save();
    res.status(201).json(newChat);
  } catch (error) {
    logger.error('Error creating chat:', error);
    res.status(400).json({ message: 'Failed to create chat' });
  }
};

exports.addMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  try {
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.push(message);
    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    logger.error(`Error adding message to chat with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to add message' });
  }
};

exports.deleteChat = async (req, res) => {
  const { id } = req.params;

  try {
    const chat = await Chat.findByIdAndDelete(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting chat with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};
