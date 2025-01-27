// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBJIe2dSGgzPGmzu1xsMbYJMbRlBsPtMXQ",
    authDomain: "dbxd-7b391.firebaseapp.com",
    databaseURL: "https://dbxd-7b391-default-rtdb.firebaseio.com",
    projectId: "dbxd-7b391",
    storageBucket: "dbxd-7b391.firebasestorage.app",
    messagingSenderId: "183155393407",
    appId: "1:183155393407:web:b952a84d71b4f98c30104a",
    measurementId: "G-CHLKYMQ695"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ID del chat (puedes cambiarlo según tus necesidades)
const chatId = 'chat1'; // Cambia esto si tienes múltiples chats

// Función para enviar mensajes
function sendMessage(sender, messageText) {
    const messageId = Date.now(); // Usar timestamp como ID único
    database.ref('chats/' + chatId + '/messages/' + messageId).set({
        sender: sender,
        text: messageText,
        timestamp: messageId
    });
}

// Función para escuchar mensajes
function listenForMessages() {
    database.ref('chats/' + chatId + '/messages').on('value', (snapshot) => {
        const messages = snapshot.val();
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = ''; // Limpiar mensajes anteriores

        if (messages) {
            // Iterar sobre los mensajes y mostrarlos
            Object.keys(messages).forEach((key) => {
                const message = messages[key];
                const messageElement = document.createElement('div');
                messageElement.textContent = `${message.sender}: ${message.text}`;
                messagesDiv.appendChild(messageElement);
            });
        }
    });
}

// Manejar el envío del formulario
document.getElementById('chatForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const messageText = document.getElementById('messageInput').value;
    sendMessage('Usuario', messageText); // Cambia 'Usuario' por el nombre del usuario real
    document.getElementById('messageInput').value = ''; // Limpiar el campo de entrada
});

// Iniciar la escucha de mensajes
listenForMessages();