// Funzione per convertire un file immagine in formato Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Funzione per inviare la richiesta di analisi della versione
async function analizzaVersione() {
  const fotoInput = document.getElementById('fotoVersione');
  const foto = fotoInput ? fotoInput.files[0] : null;
  const libro = document.getElementById('titoloLibro').value;
  const isbn = document.getElementById('isbn').value;
  const titolo = document.getElementById('titolo').value;
  const incipit = document.getElementById('incipit').value;

  const risultatiSection = document.getElementById('risultati');
  const outputAnalisi = document.getElementById('output-analisi');

  if (!incipit && !titolo && !foto) {
    alert("Inserisci il titolo, le prime parole della versione o carica un'immagine!");
    return;
  }

  risultatiSection.classList.remove('hidden');
  outputAnalisi.innerHTML = "<p><i>Analisi in corso... attendere prego.</i></p>";

  try {
    let contentPayload = [];

    const testoPrompt = `Effettua un'analisi approfondita e completa di questa versione di latino:
- Titolo della versione: ${titolo || 'Non specificato'}
- Libro di testo: ${libro || 'Non specificato'} (ISBN: ${isbn || 'N/D'})
- Testo / Incipit fornito: ${incipit || 'Vedi immagine allegata'}

Segui rigorosamente questo schema di risposta:

1. TRADUZIONE
Fornisci la traduzione integrale e fluida in italiano.

2. ANALISI DETTAGLIATA (Frase per Frase)
Per ogni singola frase del testo latino:
   a) TRADUZIONE DELLA FRASE
   b) ANALISI GRAMMATICALE COMPLETA: Analizza ciascuna parola indicando parte del discorso, caso, genere, numero, e per i verbi modo, tempo, persona e paradigma completo.
   c) ANALISI LOGICA: Indica chiaramente il ruolo sintattico di ogni elemento (soggetto, predicato, complementi).
   d) ANALISI DEL PERIODO: Identifica la proposizione principale, le coordinate e le subordinate (specificando il tipo di subordinata e il grado).`;

    if (foto) {
      const base64Image = await fileToBase64(foto);
      contentPayload = [
        { type: "text", text: testoPrompt },
        { type: "image_url", image_url: { url: base64Image } }
      ];
    } else {
      contentPayload = testoPrompt;
    }

    const response = await fetch('/api/get-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Sei un professore universitario ed esperto analizzatore di sintassi latina, estremamente rigido e rigoroso nella distinzione tra analisi grammaticale, logica e del periodo." },
          { role: "user", content: contentPayload }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Errore nella risposta del server");
    }

    outputAnalisi.innerHTML = `<div style="white-space: pre-wrap; line-height: 1.6;">${data.text}</div>`;

  } catch (error) {
    outputAnalisi.innerHTML = `<p style="color: red;"><b>Errore durante l'analisi:</b> ${error.message}</p>`;
  }
}

// Funzione per il Tutor (Chat)
async function inviaDomandaChat() {
  const inputEl = document.getElementById('chat-input');
  const chatBox = document.getElementById('chat-box');
  const messaggio = inputEl.value.trim();

  if (!messaggio) return;

  chatBox.innerHTML += `<div class="chat-msg user"><b>Tu:</b> ${messaggio}</div>`;
  inputEl.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  const loadingId = 'loading-' + Date.now();
  chatBox.innerHTML += `<div class="chat-msg ai" id="${loadingId}"><b>Tutor:</b> <i>Sta scrivendo...</i></div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch('/api/get-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Sei un Tutor esperto di latino, chiaro e di supporto per gli studenti." },
          { role: "user", content: messaggio }
        ]
      })
    });

    const data = await response.json();
    const loadingEl = document.getElementById(loadingId);

    if (!response.ok) {
      throw new Error(data.error || "Errore nella risposta del Tutor");
    }

    if (loadingEl) {
      loadingEl.innerHTML = `<b>Tutor:</b> ${data.text}`;
    }

  } catch (error) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.innerHTML = `<span style="color: red;"><b>Errore:</b> ${error.message}</span>`;
    }
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
