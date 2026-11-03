
"use client";

import { useState } from "react";
import FloorMap from "./FloorMap";


const translations = {
  en: {
    title: "Unpri Campus Navigator",
    floors: "Floors",
    selectFloor: "Select a floor",
    assistant: "AI Assistant",
    assistantDesc: "Need help navigating?",
    mapTitle: "Campus Floor Plan",
    room: "Room",
    function: "Function",
    close: "Close",
    chatTitle: "Campus AI Assistant",
    welcome: "Hello! How can I help you explore the campus?",
    placeholder: "Ask me about the campus...",
    send: "Send",
    rooms: {
      classroom: "Classroom",
      laboratory: "Computer Laboratory",
      faculty: "FAST Faculty Office",
      elevator: "Elevator",
    },
    descriptions: {
      classroom: "A room used for lectures, classes, and academic activities.",
      laboratory: "A computer-equipped room for practical sessions and computing activities.",
      faculty: "An office for faculty members, lecturers, and academic staff.",
      elevator: "An elevator providing access between different floors.",
    },
  },

  id: {
    title: "Navigator Kampus UNPRI",
    floors: "Lantai",
    selectFloor: "Pilih lantai",
    assistant: "Asisten AI",
    assistantDesc: "Butuh bantuan navigasi?",
    mapTitle: "Denah Lantai Kampus",
    room: "Ruangan",
    function: "Fungsi",
    close: "Tutup",
    chatTitle: "Asisten AI Kampus",
    welcome: "Halo! Bagaimana saya bisa membantu Anda menjelajahi kampus?",
    placeholder: "Tanyakan sesuatu tentang kampus...",
    send: "Kirim",
    rooms: {
      classroom: "Ruang Kelas",
      laboratory: "Laboratorium Komputer",
      faculty: "Kantor Fakultas FAST",
      elevator: "Lift",
    },
    descriptions: {
      classroom: "Ruangan yang digunakan untuk kegiatan perkuliahan dan aktivitas akademik.",
      laboratory: "Ruangan laboratorium komputer untuk kegiatan praktikum dan ujian.",
      faculty: "Kantor untuk dosen dan staf akademik FAST.",
      elevator: "Lift yang digunakan untuk mengakses lantai yang berbeda.",
    },
  },
};


const floors = [
  {
    id: 0,
    name: "18th Floor",
    nameID: "Lantai 18",
    rooms: [
      { id: "classroom", number: "1801", x: 8, y: 8, width: 30, height: 34 },
      { id: "classroom", number: "1802", x: 48, y: 13, width: 25, height: 29 },
      { id: "faculty", number: "F1801", x: 9, y: 55, width: 28, height: 31 },
      { id: "laboratory", number: "LAB 18", x: 53, y: 56, width: 29, height: 30 },
      { id: "elevator", number: "E1", x: 84, y: 8, width: 10, height: 22 },
    ],
  },
  {
    id: 1,
    name: "19th Floor",
    nameID: "Lantai 19",
    rooms: [
      { id: "classroom", number: "1901", x: 8, y: 8, width: 30, height: 34 },
      { id: "classroom", number: "1902", x: 48, y: 13, width: 25, height: 29 },
      { id: "laboratory", number: "LAB 19", x: 9, y: 55, width: 28, height: 31 },
      { id: "faculty", number: "F1901", x: 53, y: 56, width: 29, height: 30 },
      { id: "elevator", number: "E1", x: 84, y: 8, width: 10, height: 22 },
    ],
  },
  {
    id: 2,
    name: "20th Floor",
    nameID: "Lantai 20",
    rooms: [
      
    ],
  },
  {
    id: 3,
    name: "21st floor",
    nameID: "Lantai 21",
    mapImage:"/floor_plans/floor_21.svg",
    rooms: []
  },
];

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [showFloors, setShowFloors] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const t = translations[language];
  const currentFloor = floors[selectedFloor];

  function changeFloor(floorId) {
    setSelectedFloor(floorId);
    setSelectedRoom(null);
    setShowFloors(false);
    setZoom(1);
  }

  function sendMessage(event) {
    event.preventDefault();

    if (!message.trim()) return;

    const userMessage = message.trim();

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: userMessage },
      {
        sender: "bot",
        text:
          language === "en"
            ? "I'm currently a prototype assistant. AI campus assistance will be connected later."
            : "Saat ini saya masih berupa prototipe. Fitur bantuan AI kampus akan dihubungkan nanti.",
      },
    ]);

    setMessage("");
  }

  function zoomIn() {
    setZoom((previous) => Math.min(previous + 0.2, 2));
  }

  function zoomOut() {
    setZoom((previous) => Math.max(previous - 0.2, 0.6));
  }

  function handleMapRoomClick(number) {
    const isClassroom = number.startsWith("A-") || number.startsWith("B-");
    setSelectedRoom({
      id: isClassroom ? "classroom" :"unknown",
      number,
    });

  }

  return (
    <main className="app">
      <nav className="navbar navbar-dark campus-navbar">
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center gap-3">
            <div className="brand-icon">
                <img src="/Logo.png" alt="Campus Navigator Logo" />

            </div>
            <span className="navbar-brand mb-0 fw-semibold">
              {t.title}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className={`btn btn-sm ${
                language === "en" ? "btn-light" : "btn-outline-light"
              }`}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>

            <button
              className={`btn btn-sm ${
                language === "id" ? "btn-light" : "btn-outline-light"
              }`}
              onClick={() => setLanguage("id")}
            >
              ID
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid p-0 dashboard">
        <div className="row g-0 h-100">

          <aside className="col-auto sidebar">
            <div className="sidebar-top p-3">

              <button
                className="btn btn-light border w-100 d-flex justify-content-between align-items-center floor-button"
                onClick={() => setShowFloors((previous) => !previous)}
              >
                <span>{t.floors}</span>
                <span>{showFloors ? "▲" : "▼"}</span>
              </button>

              {showFloors && (
                <div className="floor-list shadow-sm">
                  <p className="text-secondary small mb-2">
                    {t.selectFloor}
                  </p>

                  {floors.map((floor) => (
                    <button
                      key={floor.id}
                      className={`btn w-100 text-start floor-option ${
                        selectedFloor === floor.id ? "selected" : ""
                      }`}
                      onClick={() => changeFloor(floor.id)}
                    >
                      {language === "en" ? floor.name : floor.nameID}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="sidebar-chatbot"
              onClick={() => setShowChat((previous) => !previous)}
            >
              <span className="chatbot-icon">
              <img src="/chatbotavatar.jpg" alt="chatbot navigator" />

              </span>

              <span className="chatbot-text">
                <strong>{t.assistant}</strong>
                <small>{t.assistantDesc}</small>
              </span>

              <span className="chatbot-arrow">→</span>
            </button>
          </aside>

          <section className="col main-content">
            <div className="map-controls d-flex justify-content-between align-items-center p-3">
              <div className="zoom-controls btn-group-vertical">
                <button
                  className="btn btn-outline-secondary"
                  onClick={zoomIn}
                  disabled={zoom >= 2}
                  aria-label="Zoom in"
                >
                  +
                </button>

                <button
                  className="btn btn-outline-secondary"
                  onClick={zoomOut}
                  disabled={zoom <= 0.6}
                  aria-label="Zoom out"
                >
                  −
                </button>
              </div>

              <span className="badge floor-indicator">
                {language === "en"
                  ? currentFloor.name
                  : currentFloor.nameID}
              </span>
            </div>

            <div className="map-viewport">
              <div
                className="floor_plan"
                style={{ transform: `scale(${zoom})` }}
              >
                {currentFloor.mapImage ? (
                  <FloorMap
                 src={currentFloor.mapImage}
                 onRoomClick={(handleMapRoomClick) => console.log("clicked:", roomNumber)}
                  />
                ) : (
                  currentFloor.rooms.map((room, index) => (

                    <button
                    key={`${room.number}-${index}`}
                    className={`map_room room_${room.id}`}
                    style={{
                      left: `${room.x}%`,
                      top: `${room.y}%`,
                      width:`${room.width}%`,
                      height: `${room.height}%`,
                    }}
                    onClick={() => setSelectedRoom(room)}
                    >
                      <strong>{room.number}</strong>
                      <small>{t.rooms[room.id]}</small>
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {selectedRoom && (
        <div
          className="room-modal-overlay"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="modal-dialog room-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {t.rooms[selectedRoom.id] ?? selectedRoom.number}
                </h5>

                <button
                  className="btn-close"
                  onClick={() => setSelectedRoom(null)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body">
                <p>
                  <strong>{t.room}:</strong> {selectedRoom.number}
                </p>

                <p className="mb-2">
                  <strong>{t.function}:</strong>
                </p>

                <p>{t.descriptions[selectedRoom.id] ?? ""}</p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  onClick={() => setSelectedRoom(null)}
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showChat && (
        <section className="chat-panel shadow">
          <div className="chat-header">
            <strong>{t.chatTitle}</strong>

            <button
              className="btn-close btn-close-white"
              onClick={() => setShowChat(false)}
              aria-label="Close chat"
            />
          </div>

          <div className="chat-messages">
            <div className="chat-message bot-message">
              {t.welcome}
            </div>

            {messages.map((item, index) => (
              <div
                key={index}
                className={
                  item.sender === "user"
                    ? "chat-message user-message"
                    : "chat-message bot-message"
                }
              >
                {item.text}
              </div>
            ))}
          </div>

          <form className="chat-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              className="form-control"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t.placeholder}
            />

            <button type="submit" className="btn btn-danger">
              {t.send}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
