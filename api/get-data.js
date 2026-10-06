export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  // Legge la chiave di OpenRouter dalle variabili d'ambiente di Vercel
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Chiave API non configurata su Vercel' });
  }

  try {
    const { messages } = req.body;

    // Chiamata all'endpoint di OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vercel.com", // Opzionale per OpenRouter
        "X-Title": "Analizzatore Latino"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Modello gratuito/economico su OpenRouter
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Errore nella comunicazione con OpenRouter");
    }

    const testoRisposta = data.choices[0].message.content;
    res.status(200).json({ text: testoRisposta });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
