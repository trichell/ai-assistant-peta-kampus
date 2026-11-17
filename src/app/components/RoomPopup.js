"use client";

export default function RoomPopup({ room, language, onClose }) {
  if (!room) return null;

  const isEnglish = language === "en";

  return (
    <div className="room-popup-overlay" onClick={onClose}>
      <div
        className="room-popup"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="room-popup-close"
          onClick={onClose}
        >
          &times;
        </button>

        <h3>
          {room.room_name_en || room.room_number}
        </h3>

        <p>
          <strong>{isEnglish ? "Room Number" : "Nomor Ruangan"}:</strong>{" "}
          {room.room_number}
        </p>

        <p>
          <strong>{isEnglish ? "Room Type" : "Jenis Ruangan"}:</strong>{" "}
          {room.room_type || "-"}
        </p>

        <p>
          <strong>{isEnglish ? "Description" : "Deskripsi"}:</strong>
          <br />
          {isEnglish
            ? room.description_en || "-"
            : room.description_id || "-"}
        </p>

        <p>
          <strong>{isEnglish ? "Location" : "Lokasi"}:</strong>
          <br />
          {isEnglish
            ? room.location_en || "-"
            : room.location_id || "-"}
        </p>

        <p>
          <strong>{isEnglish ? "Facilities" : "Fasilitas"}:</strong>
          <br />
          {isEnglish
            ? room.facilities_en || "-"
            : room.facilities_id || "-"}
        </p>
      </div>
    </div>
  );
}