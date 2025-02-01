const { createServer } = require('http');
const { Server } = require('socket.io');

const express = require('express');
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins (replace with frontend URL in production)
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    onlineUsers.set(socket.id, username);
    io.emit('onlineUsers', Array.from(onlineUsers.values())); // Update users
  });

  socket.on('sendMessage', (message) => {
    const username = onlineUsers.get(socket.id);
    if (username) {
      io.emit('receiveMessage', { sender: username, text: message.text, timestamp: message.timestamp });
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.values()));
  });
});

// Add a simple HTTP route to verify the server is running
app.get('/', (req, res) => {
  res.send('Chat server is running...');
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
