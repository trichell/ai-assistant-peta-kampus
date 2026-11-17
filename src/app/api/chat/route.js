
import db from "../../../../lib/db";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { messages, language } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Get the latest user message
    const latestMessage = [...messages]
      .reverse()
      .find((item) => item.role === "user");

    if (!latestMessage?.content) {
      return Response.json(
        { error: "User message is required" },
        { status: 400 }
      );
    }

    const question = String(latestMessage.content).trim();

    const floorMatch = question.match(
  /(\d{1,2})(?:st|nd|rd|th)?\s*(?:floor|lantai)|(?:floor|lantai)\s*(?:ke[- ]?)?(\d{1,2})/i
);

    let rooms = [];

    if (floorMatch) {
const floorNumber = Number(floorMatch[1] || floorMatch[2]);

      const [rows] = await db.query(
        `SELECT
          f.floor_number,
          r.room_number,
          r.room_name_id,
          r.room_name_en,
          r.room_type,
          r.description_id,
          r.description_en,
          r.location_id,
          r.location_en,
          r.facilities_id,
          r.facilities_en
        FROM rooms r
        JOIN floors f ON r.floor_id = f.id
        WHERE f.floor_number = ?
        ORDER BY r.room_number`,
        [floorNumber]
      );

      rooms = rows;
    } else {
      // Search for relevant room information
      const stopWords = new Set([
        "what", "where", "which", "who", "how", "can",
        "could", "does", "do", "is", "are", "the", "a",
        "an", "in", "on", "at", "to", "of", "for",
        "please", "tell", "me", "about", "find", "show",
        "yang", "apa", "dimana", "di", "ke", "dari",
        "dan", "atau", "untuk", "tolong", "saya",
        "ruangan", "ruang", "lantai", "kampus",
        "ada", "berapa", "fungsi", "lokasi"
      ]);

      const keywords = [
        ...new Set(
          question
            .toLowerCase()
            .match(/[a-z0-9-]+/g) || []
        ),
      ].filter(
        (word) => word.length >= 2 && !stopWords.has(word)
      );

      if (keywords.length > 0) {
        const searchableFields = [
          "r.room_number",
          "r.room_name_id",
          "r.room_name_en",
          "r.room_type",
          "r.description_id",
          "r.description_en",
          "r.location_id",
          "r.location_en",
          "r.facilities_id",
          "r.facilities_en",
        ];

        const conditions = [];
        const values = [];

        for (const keyword of keywords) {
          const fieldConditions = searchableFields
            .map((field) => `${field} LIKE ?`);

          conditions.push(`(${fieldConditions.join(" OR ")})`);

          searchableFields.forEach(() => {
            values.push(`%${keyword}%`);
          });
        }

        const [rows] = await db.query(
          `SELECT
            f.floor_number,
            r.room_number,
            r.room_name_id,
            r.room_name_en,
            r.room_type,
            r.description_id,
            r.description_en,
            r.location_id,
            r.location_en,
            r.facilities_id,
            r.facilities_en
          FROM rooms r
          JOIN floors f ON r.floor_id = f.id
          WHERE ${conditions.join(" OR ")}
          ORDER BY f.floor_number, r.room_number
          LIMIT 20`,
          values
        );

        rooms = rows;
      }
    }

    const roomContext = rooms.map((room) => ({
      floor: room.floor_number,
      room_number: room.room_number,
      room_name:
        language === "id"
          ? room.room_name_id
          : room.room_name_en || room.room_name_id,
      room_type: room.room_type,
      description:
        language === "id"
          ? room.description_id
          : room.description_en || room.description_id,
      location:
        language === "id"
          ? room.location_id
          : room.location_en || room.location_id,
      facilities:
        language === "id"
          ? room.facilities_id
          : room.facilities_en || room.facilities_id,
    }));

    const systemPrompt =
      language === "id"
        ? `Kamu adalah asisten AI Peta Kampus Universitas Prima Indonesia (UNPRI).

Jawab menggunakan Bahasa Indonesia yang jelas, ramah, dan singkat.

Gunakan DATA DATABASE RUANGAN yang diberikan sebagai sumber utama untuk menjawab pertanyaan tentang ruangan, nomor ruangan, lantai, lokasi, fungsi, dan fasilitas kampus.

ATURAN:
1. Jangan pernah mengarang nomor ruangan, nama ruangan, lokasi, fungsi, atau fasilitas.
2. Jika informasi tidak tersedia dalam data, katakan bahwa informasi tersebut belum tersedia di database.
3. Pastikan nomor ruangan dan lantainya sesuai dengan data.
4. Jangan menganggap dua ruangan memiliki fungsi yang sama tanpa bukti.
5. Pertahankan nama resmi ruangan dan singkatan seperti FAST atau RUANG SEPEN.
6. Jika data yang diberikan tidak relevan dengan pertanyaan, jangan gunakan data tersebut sebagai jawaban.
7. Jawab pertanyaan umum dengan sewajarnya, tetapi jangan mengarang informasi khusus tentang kampus.

DATA DATABASE RUANGAN:
${JSON.stringify(roomContext) || "[]"}`

        : `You are the AI Campus Map Assistant for Universitas Prima Indonesia (UNPRI).

Answer in clear, friendly, concise English.

Use the PROVIDED ROOM DATABASE DATA as the primary source for questions about campus rooms, room numbers, floors, locations, functions, and facilities.

RULES:
1. Never invent room numbers, room names, locations, functions, or facilities.
2. If the requested information is not available in the data, say that it is not available in the database.
3. Make sure room numbers and floors match the database exactly.
4. Never assume two rooms have the same function without evidence.
5. Preserve official room names and abbreviations such as FAST and RUANG SEPEN.
6. If the provided records are not relevant to the question, do not use them as an answer.
7. Answer general questions naturally, but do not invent specific campus information.

ROOM DATABASE DATA:
${JSON.stringify(roomContext) || "[]"}`;

    const recentMessages = messages.slice(-8);

    const response = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  model: "qwen3.5:4b",
  messages: [
    {
      role: "system",
      content: systemPrompt,
    },
    ...recentMessages,
  ],
  stream: false,
  think: false,
  keep_alive: "10m",
  options: {
    temperature: 0.2,
    num_predict: 300,
    num_ctx: 2048,
  },
}),
      }
    );

    if (!response.ok) {
      throw new Error("Ollama request failed");
    }

    const data = await response.json();

    const reply = data.message?.content?.trim();

if (!reply) {
  console.error("Empty Ollama response:", data);

  return Response.json(
    { error: "AI returned an empty response. Please try again." },
    { status: 502 }
  );
}

return Response.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: error.message || "AI request failed" },
      { status: 500 }
    );
  }
}
