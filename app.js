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
  outputAnalisi.innerHTML = "<p><i>Analisi e traduzione in corso... attendere prego.</i></p>";

  try {
    let contentPayload = [];

    const testoPrompt = `Analizza questa versione di latino con estremo rigore accademico e precisione filologica:
- Titolo: ${titolo || 'Non specificato'}
- Libro / ISBN: ${libro || 'N/D'} (${isbn || 'N/D'})
- Testo / Incipit: ${incipit || 'Vedi foto allegata'}

ISTRUZIONI TASSATIVE:
1. TRASCRIZIONE: Se è presente un'immagine, trascrivi prima con cura il testo latino completo presente nella foto.
2. TRADUZIONE D'AUTORE INTEGRALE: Fornisci una traduzione completa in un italiano impeccabile, elegante e naturale, che renda perfettamente il senso del testo latino senza sembrare una traduzione automatica.
3. ANALISI DETTAGLIATA PER OGNI SINGOLA FRASE: Non saltare, accorpare o omettere alcuna frase del testo latino. Per ciascuna frase fornisci:
   a) FRASE LATINA E TRADUZIONE LETTERALE DI SERVIZIO
   b) ANALISI GRAMMATICALE COMPLETA (parte del discorso, caso, genere, numero; per i verbi: modo, tempo, persona, diatesi e paradigma completo).
   c) ANALISI LOGICA (soggetto, predicato verbale/nominale, attributi, apposizioni e tutti i complementi).
   d) ANALISI DEL PERIODO (proposizione principale, coordinate e subordinate con specificazione di tipo, grado e forma esplicita/implicita).`;

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
          { 
            role: "system", 
            content: "Sei un insigne professore di Filologia Classica e Traduzione Latina. Il tuo compito è trascrivere con accuratezza chirurgica il testo latino fornito, fornire una traduzione italiana impeccabile dal punto di vista stilistico e concettuale, ed effettuare l'analisi grammaticale, logica e del periodo per OGNI singola frase del testo senza mai ometterne alcuna." 
          },
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
