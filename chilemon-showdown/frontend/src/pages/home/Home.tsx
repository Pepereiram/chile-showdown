import { useState, useEffect } from "react";
import axios from "axios";
import type { Team } from "../../types/Team";
import type { TeamChilemon } from "../../types/TeamChilemon";

import ButtonLink from "../../components/ButtonLink";
import TeamSelector from "../../components/TeamSelector";

import { Container, Paper, Typography, Stack } from "@mui/material";

type TeamView = {
  id: string;
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
  //const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const auth = {
          withCredentials: true,
          headers: { "X-CSRF-Token": localStorage.getItem("csrf") || "" },
        };

        // Equipos del usuario autenticado (el backend usa la cookie, no userId)
        const teamsRes = await axios.get<Team[]>(
          `http://localhost:3001/api/teams`,
          auth
        );

        const teamsCargados = teamsRes.data;

        // Por cada equipo, extrae sus miembros
        const teamsWithMembers: TeamView[] = await Promise.all(
          teamsCargados.map(async (t) => {
            const membersRes = await axios.get<TeamChilemon[]>(
              `http://localhost:3001/api/teamChilemon`,
              { params: { teamId: t.id }, ...auth }
            );

            const members = membersRes.data
              .sort((a, b) => a.position - b.position)
              .map((m) => m.nickname.trim().slice(0, 2).toUpperCase());

            return {
              id: String(t.id),
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
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "calc(100vh - 64px)", // Navbar height
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          color="primary"
          sx={{ mb: 1 }}
        >
          Chilemon Showdown
        </Typography>

        <Stack spacing={2} alignItems="center" sx={{ width: "100%" }}>
          <ButtonLink route="random-battle" text="Random Battle" fullWidth />

          <ButtonLink route="team-builder" text="Team Builder" fullWidth />

          <TeamSelector
            teams={teams}
            selectedTeamId={selectedTeam?.id ?? null}
            onChange={(id) =>
              setSelectedTeam(teams.find((t) => t.id === id) || null)
            }
          />

          <ButtonLink route="battle/" text="Battle with Selected Team" fullWidth />

          {teams.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              No tienes equipos todavía.
            </Typography>
          )}

          <ButtonLink route="profile" text="Edit Profile" fullWidth />
        </Stack>
      </Paper>
    </Container>
  );
}
