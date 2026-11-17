
import db from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const floorNumber = searchParams.get("floor");

    let sql = `
      SELECT
        rooms.id,
        rooms.floor_id,
        floors.floor_number,
        rooms.room_number,
        rooms.room_name_en,
        rooms.room_name_id,
        rooms.room_type,
        rooms.description_en,
        rooms.description_id,
        rooms.location_en,
        rooms.location_id,
        rooms.facilities_en,
        rooms.facilities_id
      FROM rooms
      INNER JOIN floors
        ON rooms.floor_id = floors.id
    `;

    const params = [];

    if (floorNumber) {
      sql += " WHERE floors.floor_number = ?";
      params.push(floorNumber);
    }

    sql += " ORDER BY rooms.room_number ASC";

    const [rooms] = await db.query(sql, params);

    return Response.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error("Rooms API error:", error);

    return Response.json(
      { success: false, message: "Failed to retrieve rooms" },
      { status: 500 }
    );
  }
}
