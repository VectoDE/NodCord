const Chat = require('../../models/chatModel');

exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find();
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createChat = async (req, res) => {
  const chat = new Chat({
    participants: req.body.participants,
    messages: req.body.messages,
    type: req.body.type,
  });

  try {
    const newChat = await chat.save();
    res.status(201).json(newChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.messages.push(req.body.message);
    await chat.save();

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
