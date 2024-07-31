const { Server } = require('socket.io');

let io;

const initSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Ein Benutzer hat sich verbunden:', socket.id);

    socket.on('member_to_member_chat', (data) => {
      console.log('Member-to-Member-Chat:', data);
      socket.to(data.receiverId).emit('chat_message', data);
    });

    socket.on('member_to_organization_chat', (data) => {
      console.log('Member-to-Organization-Chat:', data);
      io.to(data.organizationId).emit('chat_message', data);
    });

    socket.on('member_to_group_chat', (data) => {
      console.log('Member-to-Group-Chat:', data);
      io.to(data.groupId).emit('chat_message', data);
    });

    socket.on('invite', (data) => {
      console.log('Einladung erhalten:', data);
      io.emit('invite', data);
    });

    socket.on('start_video_stream', (streamData) => {
      console.log('Video-Streaming gestartet:', streamData);
      io.emit('video_stream', streamData);
    });

    socket.on('disconnect', () => {
      console.log('Ein Benutzer hat die Verbindung getrennt:', socket.id);
    });
  });
};

module.exports = { initSocketIO };
