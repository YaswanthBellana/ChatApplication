const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const crypto = require('crypto');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Serve the client files
app.use(express.static(path.join(__dirname, '../client')));

const users = {};

io.on('connection', socket => {
    console.log('New user connected');

    socket.on('join', (username) => {
        console.log(`${username} joined the chat`);
        users[socket.id] = username;
        io.emit('userList', Object.values(users));
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            console.log(`${username} left the chat`);
            delete users[socket.id];
            io.emit('userList', Object.values(users));
        }
    });

    socket.on('chatMessage', (msg, recipientUsername) => {
        const recipientSocketId = Object.keys(users).find(key => users[key] === recipientUsername);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('chatMessage', msg, users[socket.id]);
            console.log(`Message sent from ${socket.id} to ${recipientSocketId}`);
        } else {
            console.log(`Recipient socket for ${recipientUsername} not found`);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function encrypt(text, key=255) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i) ^ key.charCodeAt(0);
      result += String.fromCharCode(charCode);
    }
    return result;
  }
