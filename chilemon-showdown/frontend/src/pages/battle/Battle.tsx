// src/pages/battle/Battle.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { HealthBar } from "../../components/HealthBar";
import type { HealthBarHandle } from "../../components/HealthBar";
import battleService from "../../services/battle";

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
  const [loading, setLoading] = useState(false);
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
  const currentUserId = parsedUser.id;
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
    const nickname = teamSlot?.nickname || `#${teamSlot?.chilemonId ?? "??"}`;
    const maxHP = state.maxHP ?? state.currentHP ?? 100;
    return {
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
        setLoading(true);
        setError(null);
        const data = await battleService.getBattle(battleId, currentUserId || undefined);
        if (!cancelled) {
          setBattle(data);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Error al cargar la batalla");
      } finally {
        if (!cancelled) setLoading(false);
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
      const updated = await battleService.submitMove(battleId, moveId);
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
    <div className="battle-page flex h-full">
      {/* LEFT: Battle arena */}
      <div className="battle-arena flex-1 flex flex-col items-center justify-between relative p-6">
        {/* Turn + status */}
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {battle ? `Turn ${battle.turn}` : "Loading battle..."}
          </h2>
          {battle && (
            <span className="text-sm uppercase">
              {battle.status === "waiting" && "Waiting for opponent"}
              {battle.status === "in-progress" && "In progress"}
              {battle.status === "finished" && "Battle finished"}
            </span>
          )}
        </div>

        {/* Opponent side (top) */}
        <div className="w-full flex justify-between items-center mb-8">
          <div className="flex flex-col gap-2">
            <span className="font-semibold">
              {opp?.username ?? "Opponent"}
            </span>
            {oppActive && (
              <span className="text-sm">
                {oppActive.name} • Lv {oppActive.level}
              </span>
            )}
            {oppActive && (
              <HealthBar
                // using key so it resets when active changes
                key={`opp-${opp?.userId}-${opp?.activeIndex}`}
                maxHealth={oppActive.maxHP}
                initial={oppActive.hp}
                position="top-right"
              />
            )}
          </div>
          {/* Placeholder sprite / image */}
          <div className="enemy-sprite w-40 h-40 bg-gray-200 rounded-full" />
        </div>

        {/* Center explosion / background */}
        <div className="battle-background absolute inset-0 pointer-events-none opacity-20">
          {/* here you can put the explosion image via CSS background */}
        </div>

        {/* Player side (bottom) */}
        <div className="w-full flex justify-between items-center mt-8">
          {/* Placeholder sprite / image */}
          <div className="player-sprite w-40 h-40 bg-gray-200 rounded-full" />

          <div className="flex flex-col items-end gap-2">
            <span className="font-semibold">
              {me?.username ?? "You"}
            </span>
            {myActive && (
              <span className="text-sm">
                {myActive.name} • Lv {myActive.level}
              </span>
            )}
            {myActive && (
              <HealthBar
                key={`me-${me?.userId}-${me?.activeIndex}`}
                maxHealth={myActive.maxHP}
                initial={myActive.hp}
                position="bottom-left"
              />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full mt-6 flex flex-col items-center gap-3">
          <div className="flex gap-3 mb-2">
            <button
              className={`px-4 py-2 rounded ${
                selectedPanel === "moves" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setSelectedPanel("moves")}
            >
              Moves
            </button>
            <button
              className={`px-4 py-2 rounded ${
                selectedPanel === "switch" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
              onClick={() => setSelectedPanel("switch")}
            >
              Switch
            </button>
            <button
              className="px-4 py-2 rounded bg-red-500 text-white"
              onClick={handleForfeit}
              disabled={submitting}
            >
              Forfeit
            </button>
          </div>

          {/* Panel content: moves or switch options */}
          <div className="w-full max-w-md p-4 border rounded bg-white/80">
            {selectedPanel === "moves" && (
              <div className="grid grid-cols-2 gap-2">
                {myActive?.moves && myActive.moves.length > 0 ? (
                  myActive.moves.map((moveId) => (
                    <button
                      key={moveId}
                      className="px-3 py-2 rounded bg-blue-500 text-white text-sm"
                      disabled={submitting}
                      onClick={() => handleMoveClick(moveId)}
                    >
                      {/* TODO: replace with real move names once we have them */}
                      Move #{moveId}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No moves available for this Chilemon.
                  </p>
                )}
              </div>
            )}

            {selectedPanel === "switch" && me && (
              <div className="grid grid-cols-3 gap-2">
                {me.team.map((slot, idx) => (
                  <button
                    key={idx}
                    className="px-2 py-2 rounded bg-green-500 text-white text-xs"
                    disabled={submitting || idx === me.activeIndex}
                    onClick={() => handleSwitchClick(idx)}
                  >
                    {slot.nickname || `Slot ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      </div>

      {/* RIGHT: Log panel */}
      <div className="battle-log-panel w-72 border-l p-4 flex flex-col bg-white">
        <h3 className="font-bold mb-2">Log</h3>
        <div className="flex-1 overflow-y-auto border rounded p-2 bg-gray-50 text-sm">
          {battle?.log && battle.log.length > 0 ? (
            battle.log.map((line, i) => (
              <div key={i} className="mb-1">
                {line}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No events yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Battle;
