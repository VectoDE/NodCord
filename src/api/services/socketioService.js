const { Server } = require('socket.io');
const http = require('http');

// Globale Variable für den Socket.IO-Server
let io;

// Initialisiert den Socket.IO-Server
exports.initSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Verbindungsevent
  io.on('connection', (socket) => {
    console.log('Ein Benutzer hat sich verbunden:', socket.id);

    // Member-to-Member-Chat empfangen
    socket.on('member_to_member_chat', (data) => {
      console.log('Member-to-Member-Chat:', data);
      // Sendet die Nachricht nur an den Empfänger
      socket.to(data.receiverId).emit('chat_message', data);
    });

    // Member-to-Organization-Chat empfangen
    socket.on('member_to_organization_chat', (data) => {
      console.log('Member-to-Organization-Chat:', data);
      // Sendet die Nachricht an alle Mitglieder der Organisation
      io.to(data.organizationId).emit('chat_message', data);
    });

    // Member-to-Group-Chat empfangen
    socket.on('member_to_group_chat', (data) => {
      console.log('Member-to-Group-Chat:', data);
      // Sendet die Nachricht an alle Mitglieder der Gruppe
      io.to(data.groupId).emit('chat_message', data);
    });

    // Einladung empfangen
    socket.on('invite', (data) => {
      console.log('Einladung erhalten:', data);
      io.emit('invite', data); // Einladung an alle Clients senden
    });

    // Video-Streaming starten
    socket.on('start_video_stream', (streamData) => {
      console.log('Video-Streaming gestartet:', streamData);
      io.emit('video_stream', streamData); // Video-Daten an alle Clients senden
    });

    // Benutzer trennt sich
    socket.on('disconnect', () => {
      console.log('Ein Benutzer hat die Verbindung getrennt:', socket.id);
    });
  });
};

// Gibt den Socket.IO-Server zurück
exports.getIO = () => io;