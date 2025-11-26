import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { getMoveNameById } from "../../services/moves";

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
    maxHP: number;
    status?: string;
  }>;
  mustSwitch?: boolean;
};

type BattleState = {
  _id: string;
  status: "waiting" | "in-progress" | "finished";
  turn: number;
  players: BattlePlayer[];
  log: string[];
  winner?: string;
};

export const Battle: React.FC = () => {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();

  const [battle, setBattle] = useState<BattleState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<"moves" | "switch" | null>(
    "moves"
  );
  const [resultDialog, setResultDialog] = useState<{ open: boolean; isWinner: boolean }>({
    open: false,
    isWinner: false,
  });

  // In a real app you'd probably take this from auth context.
  const currentUser = localStorage.getItem("user");

  if (!currentUser) {
    return <div>Please log in to view the battle.</div>;
  }

  if (!battleId) {
    return <Navigate to="/home" replace />;
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
    // Use a fixed default max HP (100) when the server doesn't provide it.
    const DEFAULT_MAX_HP = 100;
    const maxHP = state.maxHP ?? DEFAULT_MAX_HP;
    // Clamp current HP between 0 and maxHP so it never exceeds the fixed maximum.
    const currentHP = Math.max(0, Math.min(state.currentHP ?? 0, maxHP));

    return {
      // expose the chilemon id so callers can show the sprite
      id: teamSlot?.chilemonId,
      name: nickname,
      level: teamSlot?.level ?? 50,
      hp: currentHP,
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
        const data = await battleService.getBattle(battleId, currentUserId);
        if (!cancelled) {
          setBattle(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Error al cargar la batalla");
          setLoading(false);
        }
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
  }, [battleId, currentUserId, battle?.status]);

  useEffect(() => {
    if (battle?.status === "finished" && battle.winner) {
      const winnerId = battle.winner.toString();
      const isWinner = winnerId === currentUserId;
      setResultDialog({ open: true, isWinner });
    }
  }, [battle?.status, battle?.winner, currentUserId]);

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
      const updated = await battleService.submitSwitch(battleId, toIndex, currentUserId);
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
      const updated = await battleService.forfeitBattle(battleId, currentUserId);
      setBattle(updated);
      // redirect to home after forfeit
      navigate("/home");
    } catch (err: any) {
      setError(err?.message ?? "Error al rendirse");
    } finally {
      setSubmitting(false);
    }
  }

  const handleCloseResult = () => {
    setResultDialog({ ...resultDialog, open: false });
    navigate("/home");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h5">Cargando batalla...</Typography>
      </Box>
    );
  }

  if (error && !battle) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", gap: 2 }}>
        <Typography variant="h5" color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate("/home")}>
          Volver al Home
        </Button>
      </Box>
    );
  }

  if (!battle) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h5">No se encontró la batalla</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", height: "100%" }}>
        {/* LEFT: Battle arena */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", position: "relative", p: 3 }}>
          {/* Turn + status */}
          <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">
              Turn {battle.turn}
            </Typography>
            <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
              {battle.status === "waiting" && "Waiting for opponent"}
              {battle.status === "in-progress" && "In progress"}
              {battle.status === "finished" && "Battle finished"}
            </Typography>
          </Box>

          {/* Opponent side (top) */}
          <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Stack spacing={1}>
              <Typography fontWeight={600}>{opp?.username ?? "Opponent"}</Typography>
                {oppActive && (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}>
                    <Typography variant="body2">{oppActive.name} • Lv {oppActive.level}</Typography>
                    <Box sx={{ width: 160 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, Math.min(100, (oppActive.hp / (oppActive.maxHP || 1)) * 100))}
                        sx={{ height: 10, borderRadius: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">{oppActive.hp} / {oppActive.maxHP}</Typography>
                    </Box>
                  </Box>
                )}
            </Stack>

            {/* Sprite image for opponent (uses chilemon id) */}
            <Avatar
              src={oppActive?.id ? `/sprites/${oppActive.id}.png` : undefined}
              variant="circular"
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
              src={myActive?.id ? `/sprites/${myActive.id}.png` : undefined}
              variant="circular"
              alt={myActive?.name ?? "you"}
              sx={{ width: 96, height: 96, bgcolor: "grey.200" }}
            />

            <Stack alignItems="flex-end" spacing={1}>
              <Typography fontWeight={600}>{me?.username ?? "You"}</Typography>
                {myActive && (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                    <Typography variant="body2">{myActive.name} • Lv {myActive.level}</Typography>
                    <Box sx={{ width: 160 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, Math.min(100, (myActive.hp / (myActive.maxHP || 1)) * 100))}
                        sx={{ height: 10, borderRadius: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">{myActive.hp} / {myActive.maxHP}</Typography>
                    </Box>
                  </Box>
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
                          {getMoveNameById(moveId) || `Move #${moveId}`}
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
                  {me.team.map((slot, idx) => {
                    const partyChilemonState = me.partyState.find(ps => ps.refTeamIndex === idx);
                    const isKO = partyChilemonState ? (partyChilemonState.currentHP <= 0) : false;
                    return (
                      <Box key={idx}>
                        <Button fullWidth variant="contained" color="primary" size="small" disabled={submitting || me.activeIndex === idx || isKO}
                        onClick={() => handleSwitchClick(idx)}>
                          {slot.nickname || 'Slot ${idx + 1}'}
                        </Button>
                      </Box>
                    );
                  })}
                  </Box>
              )}

              {error && (
                <Typography mt={1} variant="body2" color="error" align="center">{error}</Typography>
              )}
            </Paper>
          </Box>
        </Box>

        {/* RIGHT: Log panel (fixed size with internal scroll) */}
        <Paper
          elevation={0}
          sx={{
            width: 288,
            flex: '0 0 288px',
            borderLeft: 1,
            borderColor: 'divider',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            boxSizing: 'border-box',
            height: 'calc(100vh - 64px)',
            overflow: 'hidden',
          }}
        >
          <Typography fontWeight={700} mb={1}>Log</Typography>
          <Divider />
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              mt: 1,
              pr: 1,
              // visible custom scrollbar for the log panel
              '&::-webkit-scrollbar': { width: '8px' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#c0c0c0', borderRadius: '4px' },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            }}
          >
            {battle?.log && battle.log.length > 0 ? (
              <List dense sx={{ p: 0 }}>
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

{/* victoria/ derrota */}
      <Dialog open={resultDialog.open} onClose={handleCloseResult}>
        <DialogTitle sx={{ textAlign: "center", fontSize: "2rem", fontWeight: 700 }}>
          {resultDialog.isWinner ? "¡Victoria! 🎉" : "Derrota 😔"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" textAlign="center">
            {resultDialog.isWinner
              ? "¡Felicidades! Has ganado la batalla."
              : "Has perdido la batalla. ¡Sigue entrenando!"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button variant="contained" onClick={handleCloseResult}>
            Volver al Home
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Battle;
