"use client";

import { useEffect, useState } from "react";
import "./PagePreloader.css";

export default function PagePreloader() {
    const [leaving, setLeaving] = useState(false);
    const [visible, setVisible] =  useState(true);

    useEffect(() => {
        const startFade = setTimeout(() => {
            setLeaving(true);
        }, 1700);

        const finishLoading = setTimeout(() => {
            setVisible(false);
        }, 2400);

        return () => {
            clearTimeout(startFade);
            clearTimeout(finishLoading);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
        className={`page-preloader ${
            leaving ? "preloader-leaving" : ""
        }`}
        >
            <div className="preloader-content">
                <img
                src="/Logo.png"
                alt="UNPRI Navigator Logo"
                className="preloader-logo"
                />

                <div className="preloader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
}