const socket = io('http://localhost:3000');

// Funktion zum Senden einer Nachricht im Member-to-Member-Chat
function sendMemberToMemberChat(receiverId, message) {
  socket.emit('member_to_member_chat', {
    senderId: socket.id,
    receiverId: receiverId,
    message: message
  });
}

// Funktion zum Senden einer Nachricht im Member-to-Organization-Chat
function sendMemberToOrganizationChat(organizationId, message) {
  socket.emit('member_to_organization_chat', {
    senderId: socket.id,
    organizationId: organizationId,
    message: message
  });
}

// Funktion zum Senden einer Nachricht im Member-to-Group-Chat
function sendMemberToGroupChat(groupId, message) {
  socket.emit('member_to_group_chat', {
    senderId: socket.id,
    groupId: groupId,
    message: message
  });
}

// Nachrichten empfangen
socket.on('chat_message', (data) => {
  console.log('Neue Nachricht:', data);
  // Fügen Sie hier Code hinzu, um die Nachricht anzuzeigen
});

// Einladungen empfangen
socket.on('invite', (data) => {
  console.log('Neue Einladung:', data);
  // Fügen Sie hier Code hinzu, um die Einladung anzuzeigen
});

// Video-Stream empfangen
socket.on('video_stream', (streamData) => {
  console.log('Neues Video-Streaming:', streamData);
  // Fügen Sie hier Code hinzu, um das Video anzuzeigen
});
