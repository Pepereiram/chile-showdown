import { IPlayer, IBattleChilemonState } from '../../models/battle';
import { ITeamChilemon } from '../../models/teamChilemon';
import { IChilemon } from '../../models/chilemon';
import { IMove } from '../../models/moves';
import * as fs from 'fs';
import * as path from 'path';
import Chilemon from '../../models/chilemon';
import {Stat} from '../../models/chilemon';


export function hasAvailableMon(player: IPlayer) : boolean {
  return player.partyState.some(s => s.currentHP > 0);
}

export function canSwitchTo(player: IPlayer, toIndex: number) {
  const st = player.partyState[toIndex];
  return st && st.currentHP > 0 && toIndex !== player.activeIndex;
}

// Esta es para inicializar el estado de la party
export function getStateOrThrow(player: IPlayer, idx: number): IBattleChilemonState {
  const st = player.partyState[idx];
  if (!st) throw new Error(`partyState[${idx}] no inicializado`);
  return st;
}

export function onSwitchIn(player: IPlayer, toIndex: number) {
  // reset de stages y volátiles del nuevo activo
  player.activeIndex = toIndex;
  const st = getStateOrThrow(player, toIndex);
  st.stages = { atk:0, def:0, spa:0, spd:0, spe:0, acc:0, eva:0 };
  st.volatile = {};
}

export function getActiveStateOrThrow(p: IPlayer): IBattleChilemonState {
  const st = p.partyState[p.activeIndex];
  if (!st) throw new Error(`Active partyState not initialized (index ${p.activeIndex})`);
  return st;
}

export function isFainted(p: IPlayer): boolean {
  const st = getActiveStateOrThrow(p);
  return st.currentHP <= 0;
}

/* =========================================================
   INICIALIZACIÓN DEL PARTY STATE
   ========================================================= */

export type BaseStats = {
  hp: number; atk: number; def: number; spa: number; spd: number; spe: number;
};

// El orden de stats es: HP, Atk, Def, SpA, SpD, Spe
export async function getSpeciesBaseStats(pokemonId: number): Promise<BaseStats> {
  const doc = await Chilemon.findOne({ id: pokemonId }).lean().exec();
  if (!doc) throw new Error(`Especie no encontrada: ${pokemonId}`);

  const byName = Object.fromEntries(doc.stats.map((s: Stat) => [s.name.toLowerCase(), s.base_value]));
  return {
    hp:  byName.hp  ?? 1,
    atk: byName.atk ?? 1,
    def: byName.def ?? 1,
    spa: byName.spa ?? 1,
    spd: byName.spd ?? 1,
    spe: byName.spe ?? 1,
  };
}

export function calcStat(base: number, ev: number, level: number, isHP = false): number {
  if (isHP) return Math.floor(((2 * base + Math.floor(ev / 4)) * level) / 100) + level + 10;
  return Math.floor(((2 * base + Math.floor(ev / 4)) * level) / 100) + 5;
}

export async function initializePartyState(team: ITeamChilemon[]) {
  const states: IBattleChilemonState[] = [];
  for (const [i, slot] of team.entries()) { // <- sin indefinidos
    const base = await getSpeciesBaseStats(slot.chilemonId); 
    const totalHP = calcStat(base.hp, slot.effort[0] ?? 0, slot.level ?? 50, true);
    states.push({
      refTeamIndex: i,
      currentHP: totalHP,
      maxHP: totalHP,
      status: "none",
      stages: { atk:0, def:0, spa:0, spd:0, spe:0, acc:0, eva:0 },
      volatile: {},
    });
  }
  return states;
}

export function applyStage(value: number, stage: number): number {
  const num = stage >= 0 ? (2 + stage) : 2;
  const den = stage >= 0 ? 2 : (2 - stage);
  return Math.floor(value * (num / den));
}

export async function getStat(player: IPlayer, statName: keyof BaseStats): Promise<number> {
    const st = getStateOrThrow(player, player.activeIndex);
    const teamSlot = player.team[st.refTeamIndex];
    if (!teamSlot) throw new Error(`team[${st.refTeamIndex}] no inicializado`);

    const base = await getSpeciesBaseStats(teamSlot.chilemonId); // Mis más sinceros perdones al curso metodologías de diseño y programación
    const idxMap: Record<keyof BaseStats, number> = { hp: 0, atk: 1, def: 2, spa: 3, spd: 4, spe: 5 };

    const evIndex = idxMap[statName];
    const ev = teamSlot.effort?.[evIndex] ?? 0;
    const level = teamSlot.level ?? 50;

    const isHP = statName === 'hp';
    const raw = calcStat(base[statName], ev, level ?? 50, isHP);

    if (!isHP) {
      return applyStage(raw, st.stages[statName]);
    }
    return raw;
}

/* =========================================================
   MOVES DESDE DB (REGISTRO EN MEMORIA)
   ========================================================= */

const MOVES_BY_ID = new Map<number, IMove>();
let movesLoaded = false;

async function loadMovesFromDB() {
  if (movesLoaded) return;
  // Load moves from the static JSON file in backend/data/moves.json
  const filePath = path.join(__dirname, "../../../data/moves.json");
  const raw = await fs.promises.readFile(filePath, "utf-8");
  const moves = JSON.parse(raw) as IMove[];

  for (const m of moves) {
    const mv: IMove = {
      id: m.id,
      name: m.name,
      damage_class: m.damage_class,
      power: m.power ?? null,
      pp: m.pp,
      priority: m.priority ?? 0,
      stat_changes: Array.isArray(m.stat_changes) ? m.stat_changes : [],
      target: m.target,
      type: m.type,
      ailment: m.ailment,
      effect_entry: m.effect_entry,
    };
    MOVES_BY_ID.set(mv.id, mv);
  }

  movesLoaded = true;
  console.log(`Moves cache loaded: ${MOVES_BY_ID.size} moves.`);
}

/** Asegura que los movimientos estén cargados en memoria. */
export async function ensureMovesLoaded(): Promise<void> {
  if (!movesLoaded) {
    await loadMovesFromDB();
  }
}

/** Devuelve los datos de un movimiento desde la caché. */
export function getMoveData(moveId: number): IMove {
  const move = MOVES_BY_ID.get(moveId);
  if (!move) throw new Error(`Move ID ${moveId} no encontrado`);
  return move;
}


/* =========================================================
   CALCULAR DAÑO
   ========================================================= */

export function getTeamSlotOrThrow(p: IPlayer, idx: number): ITeamChilemon {
    if (idx < 0 || idx >= p.team.length) {
        throw new Error(`team index out of range: ${idx}`);
    }
    const slot = p.team[idx];
    if (!slot) throw new Error(`team[${idx}] no existe`);
    return slot;
}

export async function applyDamage(attacker: IPlayer,defender: IPlayer, move: IMove): Promise<number> {

    const atkState = getActiveStateOrThrow(attacker);
    const defState = getActiveStateOrThrow(defender);

    const atkSlot = getTeamSlotOrThrow(attacker, atkState.refTeamIndex);
    const defSlot = getTeamSlotOrThrow(defender, defState.refTeamIndex);

    // Valores de ataque y defensa
    const atkRaw = await getStat(attacker, move.damage_class === "physical" ? "atk" : "spa");
    const defRaw = await getStat(defender, move.damage_class === "physical" ? "def" : "spd");

    const level = atkSlot.level ?? 50;
    const power = move.power ?? 0;

    // Aplicar cambios en estadisticas (stages), como danza espada, etc.
    const atkEff = applyStage(atkRaw, move.damage_class === "physical" ? atkState.stages.atk : atkState.stages.spa);
    const defEff = applyStage(defRaw, move.damage_class === "physical" ? defState.stages.def : defState.stages.spd);

    // Fórmula base (simplificada)
    const damage = Math.floor((((2 * level / 5 + 2) * power * atkEff / Math.max(1, defEff)) / 50) + 2);

    // TODO: multiplicadores (STAB, tipo, crítico, clima, pantalla)
    return Math.max(1, damage);
}

export function applyStatusMove(user: IPlayer, target: IPlayer, move: IMove, battleLog: string[]) {
  // si tiene stat_changes, aplicamos cambios de stage
  if (move.stat_changes && move.stat_changes.length > 0) {
    const actor = move.target === "user" ? user : target;
    const active = getActiveStateOrThrow(actor);
    for (const { stat, change } of move.stat_changes) {
      if (stat in active.stages) {
        active.stages[stat as keyof typeof active.stages] += change;
        battleLog.push(
          `${actor.username}'s ${stat.toUpperCase()} ${change > 0 ? "increased" : "decreased"} by ${Math.abs(change)} stage(s)!`
        );
      }
    }
  }

  // efectos especiales: "heal", "reflect", "light-screen", etc.
  switch (move.name.toLowerCase()) {
    case "recover":
      const healMon = getActiveStateOrThrow(user);
      const healAmount = Math.floor(healMon.currentHP * 0.5);
      healMon.currentHP = Math.min(healMon.currentHP + healAmount, healMon.currentHP);
      battleLog.push(`${user.username}'s Chilemon regained some HP!`);
      break;

    case "reflect":
      user.sideEffects = user.sideEffects || {};
      user.sideEffects.reflect = 5; // turnos activos
      battleLog.push(`${user.username} set up Reflect!`);
      break;

    case "light-screen":
      user.sideEffects = user.sideEffects || {};
      user.sideEffects.lightScreen = 5;
      battleLog.push(`${user.username} set up Light Screen!`);
      break;

  }
}

/* =========================================================
   PRECISION Y EVASION
   ========================================================= */

export type Stage = -6|-5|-4|-3|-2|-1|0|1|2|3|4|5|6;

export function clampStage(s: number): Stage {
  return Math.max(-6, Math.min(6, Math.trunc(s))) as Stage;
}

/** Multiplicador para stats normales (atk/def/spa/spd/spe). */
export function stageMulStat(stage: number): number {
  const s = clampStage(stage);
  const num = s >= 0 ? (2 + s) : 2;
  const den = s >= 0 ? 2 : (2 - s);
  return num / den;
}

/** Multiplicador para accuracy/evasion. */
export function stageMulAccEva(stage: number): number {
  const s = clampStage(stage);
  const num = s >= 0 ? (3 + s) : 3;
  const den = s >= 0 ? 3 : (3 - s);
  return num / den;
}

/** Aplica stage a un valor de stat (entero). */
export function applyStageStat(value: number, stage: number): number {
  return Math.floor(value * stageMulStat(stage));
}

/** Devuelve el multiplicador total de precisión (acc vs eva). */
export function accuracyMultiplier(userAccStage: number, targetEvaStage: number): number {
  // precisión efectiva = base * (accMult / evaMult)
  const acc = stageMulAccEva(userAccStage);
  const eva = stageMulAccEva(targetEvaStage);
  return acc / eva;
}

/** Chequea si el movimiento golpea (baseAcc en 0..100; null/undefined => siempre acierta). */
export function rollToHit(baseAccuracy: number, userAccStage: number, targetEvaStage: number): boolean {
  if (baseAccuracy == null) return true; // movimientos que “siempre aciertan” en tus datos
  const eff = Math.max(0, Math.min(100, baseAccuracy * accuracyMultiplier(userAccStage, targetEvaStage)));
  return Math.random() * 100 < eff;
}