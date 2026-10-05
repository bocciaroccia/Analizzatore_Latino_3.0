export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const { messages } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Errore nella comunicazione con l'AI");
    }

    const testoRisposta = data.choices[0].message.content;
    res.status(200).json({ text: testoRisposta });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
