const express = require("express");
const bodyParser = require("body-parser");
const dialogflow = require("@google-cloud/dialogflow");
const path = require("path");
const fs = require("fs"); // 📁 Para guardar registros

const app = express();
const port = process.env.PORT || 3000;

// Carga las credenciales
const CREDENTIALS = require("./credentials.json");
const projectId = CREDENTIALS.project_id;

// Usa una sesión fija para mantener el contexto (¡clave!)
const sessionId = "soto-session-id";

const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: CREDENTIALS.client_email,
    private_key: CREDENTIALS.private_key,
  },
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  console.log("📩 Mensaje recibido del frontend:", message);

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: "es",
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    const reply = result.fulfillmentText;
    console.log("🤖 Respuesta de Dialogflow:", reply);

    // 📝 REGISTRO DE CONVERSACIÓN
    const now = new Date();
    const fecha = now.toISOString().split("T")[0]; // "2025-07-09"
    const hora = now.toTimeString().split(" ")[0]; // "14:33:02"
    const logFile = path.join(__dirname, `log_${fecha}.txt`);
    const logLine = `[${hora}] Usuario: ${message}\n[${hora}] Soto: ${reply}\n\n`;

    fs.appendFile(logFile, logLine, (err) => {
      if (err) {
        console.error("❌ No se pudo guardar la conversación:", err);
      }
    });

    res.json({ reply });
  } catch (error) {
    console.error("❌ ERROR en Dialogflow:", error);
    res.status(500).send("Error en la conexión con DialogFlow");
  }
});

app.listen(port, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${port}`);
});
