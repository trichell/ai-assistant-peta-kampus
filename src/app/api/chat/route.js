export async function POST(request) {
    try {
        const { messages, language } = await request.json();

        const systemPrompt = 
        language === "id"
        ? "Kamu adalah asisten AI Peta kampus Universitas Prima Indonesia (UNPRI). Jawab menggunakan Bahasa Indonesia. Berikan jawaban yang jelas dan ramah. Jangan mengarang informasi tentang ruangan atau lokasi kampus yang belum diberikan."
        : "You are an AI campus map assistant for Universitas Prima Indonesia (UNPRI). Answer in English. Be clear and friendly. Never invent information about campus rooms or locations that has not been provided.";

        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json",

            },
            body: JSON.stringify({
                model: "qwen3.5:4b",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages,
                ],
                stream: false,

            }),

        });

        if(!response.ok) {
            throw new Error("Ollama request failed")
        }

        const data = await response.json();

        return Response.json({
            reply: data.message.content,

        });
    } catch (error) {
        console.error("Chat API error:", error);

        return Response.json(
            { error: error.message },
            { status: 500 }
        );
    }
}