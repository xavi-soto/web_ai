// 👉 Mostrar u ocultar el chat cuando se hace clic en la burbuja de soto
document.querySelector(".chat-avatar").addEventListener("click", function () {
  const chat = document.getElementById("soto-chat");

  // Alternar visibilidad del chat
  if (chat.style.display === "none" || chat.style.display === "") {
    chat.style.display = "flex";
  } else {
    chat.style.display = "none";
  }
});

// 👉 Manejar el envío de mensajes
document.getElementById("user-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const message = this.value.trim();
    const chatMessages = document.getElementById("chat-messages");

    if (message === "") return; // No enviar mensajes vacíos

    // Mostrar mensaje del usuario
    chatMessages.innerHTML += `<div class="user-message">${message}</div>`;
    this.value = "";

    // 🌟 NUEVO: Añadir un mensaje de carga temporal de Soto
    const sotoLoadingMessage = document.createElement("div");
    sotoLoadingMessage.classList.add("bot-message", "loading");
    sotoLoadingMessage.innerHTML = "<span>...</span>"; // Puedes usar un spinner
    chatMessages.appendChild(sotoLoadingMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 🌟 NUEVO: Iniciar un temporizador para detectar el "cold start"
    const coldStartTimer = setTimeout(() => {
        sotoLoadingMessage.innerHTML = `<span>soto está dormido, tardará unos 30-50 segundos en despertar. Mientras, puedes revisar su trabajo en <a href="https://sotosotosoto.com/proyectos-patio-trasero" target="_blank">patio trasero</a>.</span>`;
    }, 5000); // 5 segundos para mostrar el mensaje de espera

    // Llamar a tu backend con el mensaje
    fetch("https://soto-ai.onrender.com/preguntar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pregunta: message,
        user_id: "usuario_demo"
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // 🌟 NUEVO: Cancelar el temporizador si la respuesta llega a tiempo
        clearTimeout(coldStartTimer);
        
        // Reemplazar el mensaje de carga con la respuesta real de Soto
        sotoLoadingMessage.innerHTML = `<strong>${data.respuesta}</strong>`;
        sotoLoadingMessage.classList.remove("loading");
        chatMessages.scrollTop = chatMessages.scrollHeight;
      })
      .catch((err) => {
        // 🌟 NUEVO: En caso de error, cancelar el temporizador y mostrar un mensaje de error
        clearTimeout(coldStartTimer);
        console.error("Error al conectar con el servidor:", err);
        sotoLoadingMessage.innerHTML = `<span>Error de conexión</span>`;
        sotoLoadingMessage.classList.remove("loading");
      });
  }
});