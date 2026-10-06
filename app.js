// Funzione per inviare la richiesta di analisi della versione
async function analizzaVersione() {
  const foto = document.getElementById('fotoVersione').files[0];
  const libro = document.getElementById('titoloLibro').value;
  const isbn = document.getElementById('isbn').value;
  const titolo = document.getElementById('titolo').value;
  const incipit = document.getElementById('incipit').value;

  const risultatiSection = document.getElementById('risultati');
  const outputAnalisi = document.getElementById('output-analisi');

  // Verifica che almeno un campo sia stato compilato
  if (!incipit && !titolo && !foto) {
    alert("Inserisci il titolo, le prime parole della versione o carica un'immagine!");
    return;
  }

  // Mostra la sezione dei risultati con messaggio di attesa
  risultatiSection.classList.remove('hidden');
  outputAnalisi.innerHTML = "<p><i>Analisi in corso tramite l'IA... attendere prego.</i></p>";

  // Prepara il prompt per l'LLM
  const prompt = `Effettua un'analisi completa di questa versione di latino:
- Titolo della versione: ${titolo || 'Non specificato'}
- Libro di testo: ${libro || 'Non specificato'} (ISBN: ${isbn || 'N/D'})
- Testo / Incipit: ${incipit || 'Vedi titolo'}

Fornisci:
1. Traduzione chiara e corretta in italiano.
2. Analisi grammaticale e paradigmi dei verbi principali.
3. Analisi logica e del periodo.`;

  try {
    const response = await fetch('/api/get-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Sei un docente ed esperto analizzatore di testi in latino." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Errore nella risposta del server");
    }

    // Mostra la risposta formattata a schermo
    outputAnalisi.innerHTML = `<div style="white-space: pre-wrap; line-height: 1.5;">${data.text}</div>`;

  } catch (error) {
    outputAnalisi.innerHTML = `<p style="color: red;"><b>Errore durante l'analisi:</b> ${error.message}</p>`;
  }
}

// Funzione per il Tutor IA (Chat)
async function inviaDomandaChat() {
  const inputEl = document.getElementById('chat-input');
  const chatBox = document.getElementById('chat-box');
  const messaggio = inputEl.value.trim();

  if (!messaggio) return;

  // Aggiunge la domanda dell'utente nella chat
  chatBox.innerHTML += `<div class="chat-msg user"><b>Tu:</b> ${messaggio}</div>`;
  inputEl.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  // Elemento temporaneo di caricamento
  const loadingId = 'loading-' + Date.now();
  chatBox.innerHTML += `<div class="chat-msg ai" id="${loadingId}"><b>Tutor IA:</b> <i>Sta scrivendo...</i></div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch('/api/get-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "Sei un Tutor IA esperto di latino, chiaro e di supporto per gli studenti." },
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
      loadingEl.innerHTML = `<b>Tutor IA:</b> ${data.text}`;
    }

  } catch (error) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.innerHTML = `<span style="color: red;"><b>Errore:</b> ${error.message}</span>`;
    }
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
