"use client";

import { useEffect, useRef, useState } from "react";

export default function FloorMap({ src, onRoomClick }) {
  const ref = useRef(null);
  const [markup, setMarkup] = useState("");

  useEffect(() => {
    fetch(src)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load floor plan");
        }
        return response.text();
      })
      .then(setMarkup)
      .catch((error) => console.error(error));
  }, [src]);

  useEffect(() => {
    if (!ref.current || !markup) return;

    const svg = ref.current.querySelector("svg");
    if (!svg) return;

    const roomPattern = /^(?:[A-Z]{1,3}\s*-?\s*)\d{3,5}$/i;

    svg.querySelectorAll("g[data-cell-id]").forEach((group) => {
      const label = group.querySelector("foreignObject");

      if (!label) return;

      const roomNumber = label.textContent
        .replace(/\s+/g, "")
        .trim();

      if (!roomPattern.test(roomNumber)) return;

      const roomShape = group.querySelector("rect");

      if (!roomShape) return;

      group.classList.add("room");
      group.dataset.room = roomNumber;

      roomShape.style.pointerEvents = "all";
      roomShape.style.cursor = "pointer";
    });
  }, [markup]);

  const handleClick = (event) => {
    const room = event.target.closest(".room");

    if (room && onRoomClick) {
      onRoomClick(room.dataset.room);
    }
  };

  return (
    <div
      ref={ref}
      className="floor_map"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}