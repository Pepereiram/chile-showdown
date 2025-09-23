import { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import type { Team } from "../../types/Team";
import type { TeamChilemon } from "../../types/TeamChilemon";

type TeamView = {
  id: number;
  name: string;
  members: string[];
};


export default function Home() {
  const user = { id: 1, username: "gustavito", password: "1234" }; // mock user para test
  // este debería ser un usuario autenticado pero setiene que implementar auth primero

  // Definimos los estados
  const [teams, setTeams] = useState<TeamView[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamView | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // La idea es tener usuarios como en el TeamView, entonces primero:
        // extraer los equipos del usuario autenticado
        const teamsRes = await axios.get<Team[]>(
          `http://localhost:3001/teams`,
          { params: { userId: user.id } }
        );

        const teamsCargados = teamsRes.data;
        // Por cada equipo, extremos sus miembros
        const teamsWithMembers: TeamView[] = await Promise.all(
          teamsCargados.map(async (t) => {
            const membersRes = await axios.get<TeamChilemon[]>(
              `http://localhost:3001/teamChilemon`,
              { params: { teamId: t.id } }
            );

            // Ahora formateamos los miembros para mostrarlos, solo usamos 2 caracteres
            // del nickname.
            const members = membersRes.data
              .sort((a, b) => a.position - b.position)
              .map((m) => {
                const nick = (m.nickname).trim();
                return nick.slice(0, 2).toUpperCase();
              });
            // Ahora tenemos el equipo con sus miembros y nombres formateados
            return {
              id: t.id,
              name: t.name,
              members,
            };
          })
        );

        setTeams(teamsWithMembers);
        setSelectedTeam(teamsWithMembers[0] || null);
      } catch (e: any) {
        console.error(e);
      }
    }

    load();
  }, [user.id]);
  console.log(teams);
  return (
    <div className="page">
        <div className="screen">
          <main className="center">
            <h1 className="title">Chilemon Showdown</h1>

            <div className="stack">
              <button className="btn" onClick={() => alert("Redirige a una batalla aleatoria")}>Random Battle</button>
              <button className="btn" onClick={() => alert("Redirige al Team Builder")}>Team Builder</button>

            {selectedTeam && (
              <>
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
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 10l5 5 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
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

                <button
                  className="btn"
                  onClick={() => alert(`Inicia una nueva batalla con el team ${selectedTeam.id}`)}
                >
                  Battle with Selected Team
                </button>
              </>
            )}

            {!selectedTeam && (
              <div className="label">No tienes equipos todavía.</div>
            )}

            <button className="linkBtn" onClick={() => alert("Redirige al perfil del usuario")}>
              Edit Profile
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}