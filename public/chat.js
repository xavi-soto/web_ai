// Variable para almacenar todo el historial del chat
let chatHistory = [];

// Función para guardar el historial en localStorage
function saveChatHistory() {
    localStorage.setItem('sotoChatHistory', JSON.stringify(chatHistory));
}

// Función para cargar el historial desde localStorage
function loadChatHistory() {
    const savedHistory = localStorage.getItem('sotoChatHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        renderChatHistory();
    }
}

// Función para renderizar el historial del chat en la interfaz
function renderChatHistory() {
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = ''; // Borrar el contenido actual
    chatHistory.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(msg.sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.innerHTML = msg.html; // Usamos el HTML guardado
        chatMessages.appendChild(messageDiv);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// 👉 Mostrar u ocultar el chat cuando se hace clic en la burbuja
document.getElementById("soto-launcher").addEventListener("click", function () {
    const chat = document.getElementById("soto-chat");
    const notif = document.getElementById("soto-notification");

    if (chat.style.display === "none" || chat.style.display === "") {
        chat.style.display = "block";
        if (notif) notif.style.display = "none";
    } else {
        chat.style.display = "none";
        if (notif) notif.style.display = "block";
    }
});

// Mostrar u ocultar el chat cuando se hace clic en la notificación
document.getElementById("soto-notification").addEventListener("click", function () {
    const chat = document.getElementById("soto-chat");
    const notif = document.getElementById("soto-notification");

    chat.style.display = "block";
    if (notif) notif.style.display = "none";
});

// Cerrar el chat cuando se hace clic en la "X"
document.getElementById("close-chat").addEventListener("click", function () {
    const chat = document.getElementById("soto-chat");
    const notif = document.getElementById("soto-notification");

    chat.style.display = "none";
    if (notif) notif.style.display = "block";
});

// Manejar los mensajes y respuestas
document.getElementById("user-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        const message = this.value;
        const chatMessages = document.getElementById("chat-messages");

        if (message.trim() === "") return;

        // Añadir el mensaje del usuario al historial (guardando el HTML)
        const userHtml = `<div>${message}</div>`;
        chatHistory.push({ sender: 'user', html: userHtml });
        chatMessages.innerHTML += `<div class="user-message">${userHtml}</div>`;
        this.value = "";
        saveChatHistory();

        // Mensaje de carga
        const sotoLoadingMessage = document.createElement("div");
        sotoLoadingMessage.classList.add("bot-message", "loading");
        sotoLoadingMessage.innerHTML = "<span>...</span>";
        chatMessages.appendChild(sotoLoadingMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const coldStartTimer = setTimeout(() => {
            sotoLoadingMessage.innerHTML = `<span>Soto está dormido, tardará unos 30-50 segundos en despertar. Mientras, puedes revisar su trabajo en <a href="https://sotosotosoto.com/proyectos-patio-trasero" target="_blank">patio trasero</a>.</span>`;
            sotoLoadingMessage.classList.remove("loading");
        }, 5000);

        fetch("https://soto-ai.onrender.com/preguntar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pregunta: message, user_id: "usuario_demo" }),
        })
        .then((res) => res.json())
        .then((data) => {
            clearTimeout(coldStartTimer);

            // Añadir la respuesta de soto al historial (guardando el HTML)
            const sotoHtml = `<strong>${data.respuesta}</strong>`;
            chatHistory.push({ sender: 'soto', html: sotoHtml });
            sotoLoadingMessage.innerHTML = sotoHtml;
            sotoLoadingMessage.classList.remove("loading");
            chatMessages.scrollTop = chatMessages.scrollHeight;
            saveChatHistory();
        })
        .catch((err) => {
            clearTimeout(coldStartTimer);
            console.error("Error al conectar con el servidor:", err);
            const errorHtml = `<span>Error de conexión.</span>`;
            sotoLoadingMessage.innerHTML = errorHtml;
            sotoLoadingMessage.classList.remove("loading");
            chatHistory.push({ sender: 'soto', html: errorHtml });
            saveChatHistory();
        });
    }
});

// Cargar el historial del chat cuando la página se abra
loadChatHistory();