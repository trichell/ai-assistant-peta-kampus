"use client";

import { useRouter } from "next/navigation";
import "./WelcomePage.css";

export default function WelcomePage() {
    const router = useRouter();

  
         return (
        <main className="welcome-page">
            <header className="welcome-header">
                <div className="welcome-logo">
                    <img
                    src="/Logo.png"
                    alt="Navigator Logo"
                    />
                    </div>
                  
                  <div className="welcome-brand">
                    <span>UNPRI</span>
                    <span>CAMPUS NAVIGATOR</span>
                  </div>
                  </header>

                  <section className="welcome-content">

                  <h1 className="welcome-title">
                    <span className="titlw-white">
                        Find your way,
                    </span>

                    <span className="title-burgundy">
                    without the campus maze.
                    </span>
                    </h1>

                    <p className="welcome-description">
                        Your smart guide to navigating Universitas Prima Indonesia.
                    </p>

                    <button
                    className="welcome-button"
                    onClick={() => router.push("/campus")}
                    >
                        Explore Campus <span>→</span>
                    </button>

                  </section>

                  </main>

         );
        }