const socket = io();

function joinChat() {
    const username = document.getElementById('username').value;
    socket.emit('join', username);
}

function decrypt(text, key=255) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i) ^ key.charCodeAt(0);
      result += String.fromCharCode(charCode);
    }
    return result;
}
function encrypt(text, key=255) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i) ^ key.charCodeAt(0);
      result += String.fromCharCode(charCode);
    }
    return result;
}

socket.on('userList', (users) => {
    const userList = document.getElementById('recipient');
    // const list = document.getElementById('userList');
    
    userList.innerHTML = '<option value="">Select a user</option>';
    for (const user of users) {
        const option = document.createElement('option');
        // const p = document.createElement('p');
        option.value = user;
        option.text = user;
        // p.textContent = user;
        // list.appendChild(p);
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
