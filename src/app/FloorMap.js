"use client";
import { useEffect, useRef, useState } from "react";

export default function FloorMap({ src, onRoomClick}) {
    const ref = useRef(null);
    const [markup, setMarkup] = useState("");

    useEffect(() => {
        fetch(src).then((r) => r.text()).then(setMarkup);
    }, [src]);

    useEffect(() => {
        if (!ref.current || !markup) return;
        ref.current.querySelectorAll("g[data-cell-id]").forEach((g) => {
    if (g.querySelector("g[data-cell-id]")) return;
    if (!g.querySelector("rect") || !g.querySelector("text")) return;
        g.classList.add("room");
    g.dataset.room = g.querySelector("text").textContent.trim();

    });
    
    }, [markup]);

    const handleClick = (e) => {
        const room = e.target.closest(".room");
        if (room && onRoomClick) onRoomClick(room.dataset.room);
    };

    return (
        <div
        ref={ref}
        className="floor_map"
        onClick={handleClick}
        dangerouslySetInnerHTML={{__html: markup}}
        />
    );

}