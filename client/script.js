const socket = io();

function joinChat() {
    const username = document.getElementById('username').value;
    socket.emit('join', username);
}

socket.on('userList', (users) => {
    const userList = document.getElementById('recipient');
    userList.innerHTML = '<option value="">Select a user</option>';
    for (const user of users) {
        const option = document.createElement('option');
        option.value = user;
        option.text = user;
        userList.appendChild(option);
    }
});

function sendMessage() {
    const msg = document.getElementById('messageInput').value;
    const recipientUsername = document.getElementById('recipient').value;
    if (recipientUsername !== '') {
        console.log(`Sending message "${msg}" to recipient ${recipientUsername}`);
        socket.emit('chatMessage', msg, recipientUsername);
        // Clear the input field after sending message
        document.getElementById('messageInput').value = '';
    } else {
        console.log("No recipient selected.");
    }
}

socket.on('chatMessage', (msg, senderUsername) => {
    console.log(`Received message from ${senderUsername}: ${msg}`);
    displayMessage(`${senderUsername}: ${msg}`);
});

function displayMessage(message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
}
