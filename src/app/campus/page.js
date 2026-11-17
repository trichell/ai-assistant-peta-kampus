
"use client";

import { useEffect, useState } from "react";
import FloorMap from "../FloorMap";
import PagePreloader from "../components/preloader/PagePreloader";

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
  },
};

const floors = [
  {
    id: 0,
    floorNumber: 10,
    name: "10th Floor",
    nameID: "Lantai 10",
    mapImage: "/floor_plans/floor_10.svg",
    rooms: [],
  },
  {
    id: 1,
    floorNumber: 12,
    name: "12th Floor",
    nameID: "Lantai 12",
    mapImage: "/floor_plans/floor_12.svg",
    rooms: [],
  },
  {
    id: 2,
    floorNumber: 15,
    name: "15th Floor",
    nameID: "Lantai 15",
    mapImage: "/floor_plans/floor_15.svg",
    rooms: [],
  },
  {
    id: 3,
    floorNumber: 16,
    name: "16th Floor",
    nameID: "Lantai 16",
    mapImage: "/floor_plans/floor_16.svg",
    rooms: [],
  },
  {
    id: 4,
    floorNumber: 17,
    name: "17th Floor",
    nameID: "Lantai 17",
    mapImage: "/floor_plans/floor_17.svg",
    rooms: [],
  },
  {
    id: 5,
    floorNumber: 18,
    name: "18th Floor",
    nameID: "Lantai 18",
    mapImage: "/floor_plans/floor_18.svg",
    rooms: [],
  },
  {
    id: 6,
    floorNumber: 19,
    name: "19th Floor",
    nameID: "Lantai 19",
    mapImage: "/floor_plans/floor_19.svg",
    rooms: [],
  },
  {
    id: 7,
    floorNumber: 20,
    name: "20th Floor",
    nameID: "Lantai 20",
    mapImage: "/floor_plans/floor_20.svg",
    rooms: [],
  },
  {
    id: 8,
    floorNumber: 21,
    name: "21st Floor",
    nameID: "Lantai 21",
    mapImage: "/floor_plans/floor_21.svg",
    rooms: [],
  },
];

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [showFloors, setShowFloors] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const t = translations[language];
  const currentFloor = floors[selectedFloor];

  // Fetch room information from MySQL whenever the floor changes
  useEffect(() => {
    const controller = new AbortController();

    async function fetchRooms() {
      try {
        const response = await fetch(
          `/api/rooms?floor=${currentFloor.floorNumber}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch rooms");
        }

        setRooms(data.data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fetch rooms error:", error);
          setRooms([]);
        }
      }
    }

    fetchRooms();

    return () => controller.abort();
  }, [currentFloor.floorNumber]);

  // Translate room information when English is selected
  useEffect(() => {
    if (!selectedRoom?.id || language !== "en") {
      setIsTranslating(false);
      return;
    }

    const needsTranslation =
      !selectedRoom.room_name_en ||
      !selectedRoom.description_en ||
      !selectedRoom.location_en ||
      !selectedRoom.facilities_en;

    if (!needsTranslation) return;

    let cancelled = false;

    async function translateRoom() {
      try {
        setIsTranslating(true);

        const response = await fetch("/api/rooms/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: selectedRoom.id,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Translation failed");
        }

        if (!cancelled) {
          setSelectedRoom(data.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Room translation error:", error);
        }
      } finally {
        if (!cancelled) {
          setIsTranslating(false);
        }
      }
    }

    translateRoom();

    return () => {
      cancelled = true;
    };
  }, [selectedRoom?.id, language]);

  function changeFloor(floorId) {
    setSelectedFloor(floorId);
    setSelectedRoom(null);
    setShowFloors(false);
    setZoom(1);
    setRooms([]);
  }

  async function sendMessage(event) {
    event.preventDefault();

    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();

    const conversation = [
      ...messages.map((item) => ({
        role: item.sender === "user" ? "user" : "assistant",
        content: item.text,
      })),
      {
        role: "user",
        content: userMessage,
      },
    ];

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: userMessage },
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversation,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed");
      }

      setMessages((previous) => [
        ...previous,
        { sender: "bot", text: data.reply },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text:
            language === "id"
              ? "Maaf, saya tidak dapat terhubung ke AI. Silahkan coba lagi."
              : "Sorry, I couldn't connect to the AI. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function zoomIn() {
    setZoom((previous) => Math.min(previous + 0.2, 2));
  }

  function zoomOut() {
    setZoom((previous) => Math.max(previous - 0.2, 0.6));
  }

  // Match the clicked SVG room number with its MySQL record
  function handleMapRoomClick(number) {
    console.log("Room number received by page.js:", number);

    const normalize = (value) =>
      String(value || "").replace(/\s+/g, "").toUpperCase();

    const room = rooms.find(
      (item) =>
        normalize(item.room_number) === normalize(number)
    );

    console.log("Matched database room:", room);

    setSelectedRoom(
      room || {
        room_number: number,
      }
    );
  }

  return (
    <>
      <PagePreloader />

      <main className="app">
        <nav className="navbar navbar-dark campus-navbar">
          <div className="container-fluid px-4">
            <div className="d-flex align-items-center gap-3">
              <div className="brand-icon">
                <img
                  src="/Logo.png"
                  alt="Campus Navigator Logo"
                />
              </div>

              <span className="navbar-brand mb-0 fw-semibold">
                {t.title}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className={`btn btn-sm ${
                  language === "en"
                    ? "btn-light"
                    : "btn-outline-light"
                }`}
                onClick={() => setLanguage("en")}
              >
                EN
              </button>

              <button
                className={`btn btn-sm ${
                  language === "id"
                    ? "btn-light"
                    : "btn-outline-light"
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

            {/* Sidebar */}
<aside className={`col-auto sidebar ${sidebarOpen ? "" : "collapsed"}`}>              
    <div className="sidebar-top p-3">
                <button
                  className="btn btn-light border w-100 d-flex justify-content-between align-items-center floor-button"
                  onClick={() =>
                    setShowFloors((previous) => !previous)
                  }
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
                          selectedFloor === floor.id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => changeFloor(floor.id)}
                      >
                        {language === "en"
                          ? floor.name
                          : floor.nameID}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="sidebar-chatbot"
                onClick={() =>
                  setShowChat((previous) => !previous)
                }
              >
                <span className="chatbot-icon">
                  <img
                    src="/chatbotavatar.jpg"
                    alt="chatbot navigator"
                  />
                </span>

                <span className="chatbot-text">
                  <strong>{t.assistant}</strong>
                  <small>{t.assistantDesc}</small>
                </span>

                <span className="chatbot-arrow">→</span>
              </button>
            </aside>

            <section className="col main-content">
                <button
                className="sidebar-toggle"
                 onClick={() => {
                setSidebarOpen((previous) => !previous);
                setShowFloors(false);
                 }}
                    aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                    {sidebarOpen ? "<" : ">"}
                    </button>
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
                      onRoomClick={handleMapRoomClick}
                    />
                  ) : (
                    currentFloor.rooms.map((room, index) => (
                      <button
                        key={`${room.number}-${index}`}
                        className={`map_room room_${room.id}`}
                        style={{
                          left: `${room.x}%`,
                          top: `${room.y}%`,
                          width: `${room.width}%`,
                          height: `${room.height}%`,
                        }}
                        onClick={() => setSelectedRoom(room)}
                      >
                        <strong>{room.number}</strong>
                        <small>{room.id}</small>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Room information modal */}
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
                    {selectedRoom.room_number}
                    </h5>

                  <button
                    className="btn-close"
                    onClick={() => setSelectedRoom(null)}
                    aria-label="Close"
                  />
                </div>

                
<div className="modal-body">
  <p>
    <strong>{t.room}:</strong>{" "}
    {selectedRoom.room_number}
  </p>

  {selectedRoom.id ? (
    <p>
      <strong>
        {language === "en" ? "Room Type" : "Jenis Ruangan"}:
      </strong>{" "}
      {language === "en"
        ? selectedRoom.room_name_en ||
          (isTranslating
            ? "Translating..."
            : selectedRoom.room_name_id || "-")
        : selectedRoom.room_name_id || "-"}
    </p>
  ) : (
    <p className="text-secondary">
      {language === "en"
        ? "Room information has not been added to the database yet."
        : "Informasi ruangan belum ditambahkan ke database."}
    </p>
  )}
</div>


                <div className="modal-footer">
                  <button
                    className="btn chat-send-button"
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
  <section
    className={`chat-panel shadow ${sidebarOpen ? "" : "sidebar-closed"}`}
  
            style={{ backgroundColor: "#ffffff", opacity: 1 }}

          >
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

              {isLoading && (
                <div className="chat-message bot-message">
                  {language === "id"
                    ? "Sedang mengetik..."
                    : "Typing..."}
                </div>
              )}
            </div>

            <form
              className="chat-input-area"
              onSubmit={sendMessage}
            >
              <input
                type="text"
                className="form-control"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder={t.placeholder}
              />

              <button
                type="submit"
                className="btn btn-primary chat-send-button"
                disabled={isLoading || !message.trim()}
              >
                {isLoading
                  ? language === "id"
                    ? "Memproses..."
                    : "Thinking..."
                  : t.send}
              </button>
            </form>
          </section>
        )}
      </main>
    </>
  );
}
