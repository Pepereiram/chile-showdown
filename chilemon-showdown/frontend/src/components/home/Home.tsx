import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import type { LoginData } from "../../types/Login";
// -----------------------------
// React Component
// -----------------------------
export default function Home() {

    const teams = [
        {
        id: 1,
        name: "1.",
        members: ["AL", "BK", "CM", "DN", "EO", "FP"],
        },
        {
        id: 2,
        name: "2.",
        members: ["GA", "HB", "IC", "JD", "KE", "LF"],
        },
    ];

  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [open, setOpen] = useState(false);

  return (
    <div className="page">
        <div className="screen">
          <main className="center">
            <h1 className="title">Chilemon Showdown</h1>

            <div className="stack">
              <button className="btn" onClick={() => alert("Random Battle queued!")}>Random Battle</button>
              <button className="btn" onClick={() => alert("Open Team Builder")}>Team Builder</button>

              <div className="teamRow">
                <span className="label">Selected Team:</span>
                <div className="teamPicker">
                  <span className="teamIndex">{selectedTeam.name}</span>
                  <div className="avatars">
                    {selectedTeam.members.map((m, i) => (
                      <div key={i} className="avatar" aria-label={`Member ${i + 1}`}>
                        {m}
                      </div>
                    ))}
                  </div>
                  <button
                    className="chev"
                    aria-label="Select team"
                    onClick={() => setOpen((v) => !v)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {open && (
                    <ul className="dropdown" role="listbox">
                      {teams.map((t) => (
                        <li
                          key={t.id}
                          role="option"
                          aria-selected={t.id === selectedTeam.id}
                          className={"option" + (t.id === selectedTeam.id ? " selected" : "")}
                          onClick={() => {
                            setSelectedTeam(t);
                            setOpen(false);
                          }}
                        >
                          {t.name} Team
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <button className="btn" onClick={() => alert(`Battling with Team ${selectedTeam.id}`)}>
                Battle with Selected Team
              </button>
              <button className="linkBtn" onClick={() => alert("Open Profile Editor")}>Edit Profile</button>
            </div>
          </main>
        </div>
      </div>

  );
}

