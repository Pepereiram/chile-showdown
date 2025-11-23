// src/pages/battle/Battle.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import battleService from "../../services/battle";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

type BattlePlayer = {
  userId: string;
  username?: string;
  team: Array<{
    teamId: string;
    chilemonId: number;
    position: number;
    nickname?: string;
    level: number;
    moves: number[];
    effort: number[];
  }>;
  activeIndex: number;
  partyState: Array<{
    refTeamIndex: number;
    currentHP: number;
    status?: string;
    // maxHP is not in the model yet, but we support it if added later:
    maxHP?: number;
  }>;
  mustSwitch?: boolean;
};

type BattleState = {
  _id: string;
  status: "waiting" | "in-progress" | "finished";
  turn: number;
  players: BattlePlayer[];
  log: string[];
};

export const Battle: React.FC = () => {
  const { battleId } = useParams<{ battleId: string }>();

  const [battle, setBattle] = useState<BattleState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<"moves" | "switch" | null>(
    "moves"
  );

  // In a real app you'd probably take this from auth context.
  const currentUser = localStorage.getItem("user");

  if (!currentUser) {
    return <div>Please log in to view the battle.</div>;
  }

  const parsedUser = JSON.parse(currentUser);
  const currentUserId: string = parsedUser.id;
  // Figure out which side is "me" and which is the opponent
  const { me, opp } = useMemo(() => {
    if (!battle || battle.players.length === 0) {
      return { me: null as BattlePlayer | null, opp: null as BattlePlayer | null };
    }

    const myIndex =
      battle.players.findIndex((p) => p.userId === currentUserId) ?? 0;
    const safeIndex = myIndex === -1 ? 0 : myIndex;
    const otherIndex = safeIndex === 0 ? 1 : 0;

    return {
      me: battle.players[safeIndex],
      opp: battle.players[otherIndex] ?? null,
    };
  }, [battle, currentUserId]);

  // Convenience helpers to get the active chilemon + hp
  function getActiveInfo(player: BattlePlayer | null) {
    if (!player) return null;
    const state = player.partyState[player.activeIndex];
    if (!state) return null;
    const teamSlot = player.team[state.refTeamIndex];
    console.log("CHILEMON SLOT", teamSlot);
    const nickname = teamSlot?.nickname || `#${teamSlot?.chilemonId ?? "??"}`;
    const maxHP = state.maxHP ?? state.currentHP ?? 100;
    return {
      // expose the chilemon id so callers can show the sprite
      id: teamSlot?.chilemonId,
      name: nickname,
      level: teamSlot?.level ?? 50,
      hp: state.currentHP,
      maxHP,
      status: state.status ?? "none",
      moves: teamSlot?.moves ?? [],
    };
  }

  const myActive = getActiveInfo(me);
  const oppActive = getActiveInfo(opp);

  // Load battle on mount + when battleId changes
  useEffect(() => {
    if (!battleId) return;

    let cancelled = false;

    const loadBattle = async () => {
      try {
          setError(null);
        const data = await battleService.getBattle(battleId, currentUserId || undefined);
        if (!cancelled) {
          setBattle(data);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Error al cargar la batalla");
      } finally {
        if (!cancelled) {/* loading state removed */}
      }
    };

    loadBattle();

    // Optional: simple polling while the battle is in progress
    const interval = setInterval(() => {
      if (!cancelled && battle?.status === "in-progress") {
        loadBattle();
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [battleId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleMoveClick(moveId: number) {
    if (!battleId || submitting) return;
    try {
      setSubmitting(true);
      const updated = await battleService.submitMove(battleId, moveId, currentUserId);
      setBattle(updated);
    } catch (err: any) {
      setError(err?.message ?? "Error al enviar movimiento");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSwitchClick(toIndex: number) {
    if (!battleId || submitting) return;
    try {
      setSubmitting(true);
      const updated = await battleService.submitSwitch(battleId, toIndex);
      setBattle(updated);
    } catch (err: any) {
      setError(err?.message ?? "Error al cambiar de Chilemon");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForfeit() {
    if (!battleId || submitting) return;
    if (!window.confirm("¿Seguro que quieres rendirte?")) return;

    try {
      setSubmitting(true);
      const updated = await battleService.forfeitBattle(battleId);
      setBattle(updated);
    } catch (err: any) {
      setError(err?.message ?? "Error al rendirse");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {/* LEFT: Battle arena */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", position: "relative", p: 3 }}>
        {/* Turn + status */}
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">
            {battle ? `Turn ${battle.turn}` : "Loading battle..."}
          </Typography>
          {battle && (
            <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
              {battle.status === "waiting" && "Waiting for opponent"}
              {battle.status === "in-progress" && "In progress"}
              {battle.status === "finished" && "Battle finished"}
            </Typography>
          )}
        </Box>

        {/* Opponent side (top) */}
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Stack spacing={1}>
            <Typography fontWeight={600}>{opp?.username ?? "Opponent"}</Typography>
            {oppActive && (
              <Typography variant="body2">{oppActive.name} • Lv {oppActive.level}</Typography>
            )}
          </Stack>

          {/* Sprite image for opponent (uses chilemon id) */}
          <Avatar
            variant="circular"
            src={oppActive?.id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${oppActive.id}.png` : undefined}
            alt={oppActive?.name ?? "opponent"}
            sx={{ width: 96, height: 96, bgcolor: "grey.200" }}
          />
        </Box>

        {/* Center explosion / background */}
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.2 }} />

        {/* Player side (bottom) */}
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4 }}>
          {/* Sprite image for player (uses chilemon id) */}
          <Avatar
            variant="circular"
            src={myActive?.id ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${myActive.id}.png` : undefined}
            alt={myActive?.name ?? "you"}
            sx={{ width: 96, height: 96, bgcolor: "grey.200" }}
          />

          <Stack alignItems="flex-end" spacing={1}>
            <Typography fontWeight={600}>{me?.username ?? "You"}</Typography>
            {myActive && (
              <Typography variant="body2">{myActive.name} • Lv {myActive.level}</Typography>
            )}
          </Stack>
        </Box>

        {/* Action buttons */}
        <Box sx={{ width: "100%", mt: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Stack direction="row" spacing={2} mb={1}>
            <ToggleButtonGroup
              value={selectedPanel}
              exclusive
              onChange={(_, val) => setSelectedPanel(val)}
              size="small"
            >
              <ToggleButton value="moves">Moves</ToggleButton>
              <ToggleButton value="switch">Switch</ToggleButton>
            </ToggleButtonGroup>

            <Button variant="contained" color="error" onClick={handleForfeit} disabled={submitting}>Forfeit</Button>
          </Stack>

          {/* Panel content: moves or switch options */}
          <Paper sx={{ width: "100%", maxWidth: 520, p: 2, bgcolor: "rgba(255,255,255,0.9)" }}>
            {selectedPanel === "moves" && (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
                {myActive?.moves && myActive.moves.length > 0 ? (
                  myActive.moves.map((moveId) => (
                    <Box key={moveId}>
                      <Button fullWidth variant="contained" color="primary" size="small" disabled={submitting} onClick={() => handleMoveClick(moveId)}>
                        Move #{moveId}
                      </Button>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No moves available for this Chilemon.</Typography>
                )}
              </Box>
            )}

            {selectedPanel === "switch" && me && (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                {me.team.map((slot, idx) => (
                  <Box key={idx}>
                    <Button fullWidth variant="contained" color="success" size="small" disabled={submitting || idx === me.activeIndex} onClick={() => handleSwitchClick(idx)}>
                      {slot.nickname || `Slot ${idx + 1}`}
                    </Button>
                  </Box>
                ))}
              </Box>
            )}

            {error && (
              <Typography mt={1} variant="body2" color="error" align="center">{error}</Typography>
            )}
          </Paper>
        </Box>
      </Box>

      {/* RIGHT: Log panel */}
      <Paper elevation={0} sx={{ width: 288, borderLeft: 1, borderColor: "divider", p: 2, display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
        <Typography fontWeight={700} mb={1}>Log</Typography>
        <Divider />
        <Box sx={{ flex: 1, overflowY: "auto", mt: 1 }}>
          {battle?.log && battle.log.length > 0 ? (
            <List dense>
              {battle.log.map((line, i) => (
                <ListItem key={i} disablePadding>
                  <ListItemText primary={line} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">No events yet.</Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Battle;
