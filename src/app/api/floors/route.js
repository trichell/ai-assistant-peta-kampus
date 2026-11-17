
import db from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [floors] = await db.query(
      `SELECT id, floor_number, name_en, name_id, map_file
       FROM floors
       ORDER BY floor_number ASC`
    );

    return Response.json({
      success: true,
      data: floors,
    });
  } catch (error) {
    console.error("Floors API error:", error);

    return Response.json(
      { success: false, message: "Failed to retrieve floors" },
      { status: 500 }
    );
  }
}
