import { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import type { Team } from "../../types/Team";
import type { TeamChilemon } from "../../types/TeamChilemon";
import ButtonLink from "../../components/ButtonLink";
import TeamSelector from "../../components/TeamSelector";
import LayoutNavbar from "../../components/LayoutNavbar";

type TeamView = {
  id: number;
  name: string;
  members: string[];
};


export default function Home() {
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user: { id: number; username: string; password: string } | null =
    storedUser ? JSON.parse(storedUser) : null; // mock user para test
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
          { params: { userId: user?.id } }
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
  }, [user?.id]);
  console.log(teams);

  return (
    <>
    <LayoutNavbar />
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <main className="text-center flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Chilemon Showdown
        </h1>

        <div className="flex flex-col gap-2">
          <ButtonLink route="random-battle" text="Random Battle" />
          <ButtonLink route="team-builder" text="Team Builder" />
          <TeamSelector />
          <ButtonLink route="battle/" text="Battle with Selected Team" />

          {!selectedTeam && (
            <div className="text-gray-500 text-sm mt-2">
              No tienes equipos todavía.
            </div>
          )}

          <ButtonLink route="profile" text="Edit Profile" />
        </div>
      </main>
    </div>
    </>
  );
}