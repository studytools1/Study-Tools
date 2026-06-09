export default async function handler(req, res) {
  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        reply: "No llegó ningún mensaje"
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres un profesor que explica todo de forma simple para estudiantes."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    // 👇 SI OpenAI falla, lo mostramos
    if (!response.ok) {
      return res.status(500).json({
        reply: data.error?.message || "Error en OpenAI"
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        reply: "La IA no devolvió respuesta"
      });
    }

    res.status(200).json({ reply });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      reply: "Error interno del servidor"
    });
  }
}
