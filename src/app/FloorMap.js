
"use client";

import { useEffect, useRef, useState } from "react";

export default function FloorMap({ src, onRoomClick }) {
  const ref = useRef(null);
  const [markup, setMarkup] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(src)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load floor plan");
        }

        return response.text();
      })
      .then((data) => {
        if (!cancelled) setMarkup(data);
      })
      .catch((error) => console.error(error));

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (!ref.current || !markup) return;

    const svg = ref.current.querySelector("svg");
    if (!svg) return;

    const floorMatch = src.match(/floor_(\d+)\.svg/i);
    const floorNumber = floorMatch ? Number(floorMatch[1]) : null;

    const roomPattern = /^[A-Z]{1,3}-?\d{3,5}$/i;

    const romanPattern =
      /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i;

    // Clear previous room assignments.
    svg.querySelectorAll(".room[data-room]").forEach((group) => {
      group.classList.remove("room");
      delete group.dataset.room;
    });

    // Find each label and associate it with its nearest cell group.
    svg.querySelectorAll("foreignObject").forEach((label) => {
      const group = label.closest("g[data-cell-id]");

      if (!group) return;

      const roomNumber = label.textContent
        .replace(/\s+/g, "")
        .trim()
        .toUpperCase();

      const isNormalRoom = roomPattern.test(roomNumber);
      const isFloorTenRoman =
        floorNumber === 10 && romanPattern.test(roomNumber);

      if (!isNormalRoom && !isFloorTenRoman) return;

      group.classList.add("room");
      group.dataset.room = roomNumber;

      group.style.cursor = "pointer";
    });
  }, [markup, src]);

  const handleClick = (event) => {
    const room = event.target.closest("g.room[data-room]");

    if (room && onRoomClick) {
      console.log("Clicked SVG room:", room.dataset.room);
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
