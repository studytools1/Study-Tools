export default async function handler(req, res) {
  try {
    // 🔥 Leer body de forma segura (Vercel a veces lo manda como string)
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const message = body?.message;

    if (!message) {
      return res.status(400).json({
        error: "No llegó el mensaje"
      });
    }

    // 🔥 Llamada a OpenAI
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

    // 🔥 SI OPENAI FALLA → mostramos el error real
    if (!response.ok) {
      return res.status(500).json({
        error: "OpenAI error",
        status: response.status,
        details: data
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: "Sin respuesta de IA",
        raw: data
      });
    }

    // ✅ OK
    return res.status(200).json({
      reply
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);

    return res.status(500).json({
      error: "Server crash",
      message: err.message
    });
  }
}
