// Funzione che fa da ponte con la funzione Serverless su Vercel
async function inviaRichiestaAI(messages) {
  const response = await fetch("/api/get-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Errore durante la richiesta");
  }

  return data.text;
}

// Funzione per l'analisi del testo/immagine
async function eseguiAnalisi() {
  try {
    let messages = [];

    if (haFoto) {
      const base64Compresso = await comprimiImmagine(fileInput.files[0]);
      messages = [
        {
          role: "user",
          content: [
            { type: "text", text: promptAnalisi },
            { type: "image_url", image_url: { url: base64Compresso } }
          ]
        }
      ];
    } else {
      messages = [{ role: "user", content: promptAnalisi }];
    }

    const risp = await inviaRichiestaAI(messages);
    outputAnalisi.innerHTML = `<div style="white-space: pre-wrap; font-family: inherit; line-height: 1.5;">${risp}</div>`;
  } catch (error) {
    outputAnalisi.innerHTML = `<p style='color:red;'><b>Errore:</b> ${error.message}</p>`;
  }
}

// Funzione per la chat di latino
async function inviaDomandaChat() {
  const chatInput = document.getElementById("chat-input");
  const chatBox = document.getElementById("chat-box");
  const testoDomanda = chatInput.value.trim();

  if (!testoDomanda) return;

  chatBox.innerHTML += `<div class="msg-user"><b>Tu:</b> ${testoDomanda}</div>`;
  chatInput.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const rispChat = await inviaRichiestaAI([
      { role: "user", content: `Rispondi in modo conciso al dubbio di latino: "${testoDomanda}"` }
    ]);
    chatBox.innerHTML += `<div class="msg-ai"><b>Tutor:</b> ${rispChat}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    chatBox.innerHTML += `<div class="msg-ai" style="color:red;"><b>Tutor:</b> Errore di connessione.</div>`;
  }
}
