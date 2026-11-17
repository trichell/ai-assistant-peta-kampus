
import db from "../../../../../lib/db";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { roomId } = await request.json();

    if (!roomId) {
      return Response.json(
        { success: false, message: "Room ID is required" },
        { status: 400 }
      );
    }

    // 1. Get room information from MySQL
    const [rows] = await db.query(
      `SELECT
        id,
        room_number,
        room_name_id,
        room_name_en,
        description_id,
        description_en,
        location_id,
        location_en,
        facilities_id,
        facilities_en
      FROM rooms
      WHERE id = ?`,
      [roomId]
    );

    if (rows.length === 0) {
      return Response.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    const room = rows[0];

    // 2. Check which fields actually need translation
    const fields = [
      { source: "room_name_id", target: "room_name_en" },
      { source: "description_id", target: "description_en" },
      { source: "location_id", target: "location_en" },
      { source: "facilities_id", target: "facilities_en" },
    ];

    const needsTranslation = fields.filter(({ source, target }) => {
      const original = String(room[source] || "").trim();
      const translated = String(room[target] || "").trim();

      // Empty original fields do not need translation
      return original !== "" && translated === "";
    });

    // 3. Return immediately if nothing needs translating
    if (needsTranslation.length === 0) {
      return Response.json({
        success: true,
        translated: false,
        data: room,
      });
    }

    // 4. Prepare only the fields that need translation
    const sourceData = {};

    needsTranslation.forEach(({ source, target }) => {
      sourceData[target] = room[source];
    });

    const translationPrompt = `
Translate the following Indonesian campus room information into natural English.

Return ONLY a valid JSON object.
Use these exact keys:
${needsTranslation.map(({ target }) => target).join(", ")}

Do not add information or explanations.
Preserve the original meaning.

Information:
${JSON.stringify(sourceData)}
`;

    // 5. Ask Ollama to translate
    const ollamaResponse = await fetch(
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
              content:
                "You are an Indonesian-English translator. Return valid JSON only.",
            },
            {
              role: "user",
              content: translationPrompt,
            },
          ],
          format: "json",
          stream: false,
          think: false,
          keep_alive: "10m",
          options: {
            temperature: 0,
            num_predict: 180,
            num_ctx: 2048,
          },
        }),
      }
    );

    if (!ollamaResponse.ok) {
      throw new Error(
        `Ollama returned status ${ollamaResponse.status}`
      );
    }

    const ollamaData = await ollamaResponse.json();
    const content = ollamaData.message?.content;

    if (!content) {
      throw new Error("Ollama returned an empty translation");
    }

    const translated = JSON.parse(content);

    // 6. Save translations without overwriting existing values
    await db.query(
      `UPDATE rooms
       SET
         room_name_en = COALESCE(NULLIF(room_name_en, ''), ?),
         description_en = COALESCE(NULLIF(description_en, ''), ?),
         location_en = COALESCE(NULLIF(location_en, ''), ?),
         facilities_en = COALESCE(NULLIF(facilities_en, ''), ?)
       WHERE id = ?`,
      [
        translated.room_name_en || "",
        translated.description_en || "",
        translated.location_en || "",
        translated.facilities_en || "",
        roomId,
      ]
    );

    // 7. Retrieve updated room information
    const [updatedRows] = await db.query(
      `SELECT
        id,
        room_number,
        room_name_id,
        room_name_en,
        description_id,
        description_en,
        location_id,
        location_en,
        facilities_id,
        facilities_en
      FROM rooms
      WHERE id = ?`,
      [roomId]
    );

    return Response.json({
      success: true,
      translated: true,
      data: updatedRows[0],
    });

  } catch (error) {
    console.error("Room translation API error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to translate room information",
      },
      { status: 500 }
    );
  }
}
