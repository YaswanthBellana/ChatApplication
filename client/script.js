const socket = io();

function joinChat() {
    const username = document.getElementById('username').value;
    socket.emit('join', username);
}

socket.on('userList', (users) => {
    const userList = document.getElementById('userList');
    userList.innerHTML = ''; // Clear the previous options
    for (const userId in users) {
        const option = document.createElement('option');
        option.value = userId;
        option.text = users[userId];
        userList.appendChild(option);
    }
});

function sendMessage() {
    const msg = document.getElementById('messageInput').value;
    const recipientUsername = document.getElementById('recipient').value;
    if (recipientUsername !== '') {
        console.log(`Sending message "${msg}" to recipient ${recipientUsername}`);
        socket.emit('chatMessage', msg, recipientUsername);
    } else {
        console.log("No recipient selected.");
    }
}

socket.on('chatMessage', (msg, senderUsername) => {
    const decryptedMsg = decryptMessage(msg);
    console.log(`Received message from ${senderUsername}: ${decryptedMsg}`);
    displayMessage(`${senderUsername}: ${decryptedMsg}`);
});

function decryptMessage(msg) {
    const decipher = crypto.createDecipher('aes-256-cbc', 'mySecretKey');
    let decrypted = decipher.update(msg, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function displayMessage(message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
}
