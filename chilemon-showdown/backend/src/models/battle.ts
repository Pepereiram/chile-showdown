import mongoose, { Schema, Document, Types } from "mongoose";
import { ITeamChilemon } from "./teamChilemon";

// Estados para estadísticas y condiciones de estado de los Chilemon
type Stage = -6|-5|-4|-3|-2|-1|0|1|2|3|4|5|6;
type Status = "none"|"brn"|"psn"|"tox"|"slp"|"par"|"frz";

// Falta manejar lógica de estados: 
//      startTurn: frozen 
//      submitMove: paralyzed, burn, asleep
//      endTurn: toxic, psn, burn damage 

// Falta manejar estados volatiles: confusion, flinch, protect, substitute, leech seed, etc.

// Estado de un Chilemon en batalla
export interface IBattleChilemonState {
  // snapshot de referencia al slot del equipo
  refTeamIndex: number; // índice dentro de players[].team, de 1 a 6
  currentHP: number;
  maxHP: number;
  status: Status;
  stages: {
    atk: Stage; def: Stage; spa: Stage; spd: Stage; spe: Stage;
    acc: Stage; eva: Stage;
  };
  volatile: {
    confusion?: { turnsLeft: number };
    flinch?: boolean;
    protect?: boolean;
    substituteHP?: number;
    leechSeedFrom?: number; // 0 o 1 (lado rival)
    // agrega los que necesites
  };
}

export interface IPlayer {
    userId: mongoose.Types.ObjectId;
    username: string;
    team: ITeamChilemon[];   // datos base (speciesId, level, EVs, moves)
    activeIndex: number;
    partyState: IBattleChilemonState[]; // estado runtime por cada slot del team
    sideEffects?: {reflect?: number; lightScreen?: number; auroraVeil?: number; // Faltan movimientos de efecto continuo
    
      // Estos no estan en primera gen igual
      spikes?: number; toxicSpikes?: number; stealthRock?: boolean;
      tailwind?: number;
    };
    mustSwitch?: boolean; // Forzar cambio si el pokemon activo fue derrotado
}

// Guardar estados de estadísticas
const StagesSchema = new Schema<IBattleChilemonState["stages"]>({
  atk: { type: Number, default: 0, min: -6, max: 6 },
  def: { type: Number, default: 0, min: -6, max: 6 },
  spa: { type: Number, default: 0, min: -6, max: 6 },
  spd: { type: Number, default: 0, min: -6, max: 6 },
  spe: { type: Number, default: 0, min: -6, max: 6 },
  acc: { type: Number, default: 0, min: -6, max: 6 },
  eva: { type: Number, default: 0, min: -6, max: 6 },
}, { _id: false });

// Guardar estado de un Chilemon en batalla
const ChilemonStateSchema = new Schema<IBattleChilemonState>({
  refTeamIndex: { type: Number, required: true },
  currentHP: { type: Number, required: true },
  maxHP: { type: Number, required: true },
  status: { type: String, default: "none" },
  stages: { type: StagesSchema, default: () => ({}) },
  volatile: { type: Schema.Types.Mixed, default: {} },
}, { _id: false });

// Jugador en batalla
const PlayerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  team: [{
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    chilemonId: Number, position: Number, nickname: String, level: Number,
    moves: [Number], effort: [Number],
  }],
  activeIndex: { type: Number, default: 0 },
  partyState: { type: [ChilemonStateSchema], default: [] },
  sideEffects: { type: Schema.Types.Mixed, default: {} },
  mustSwitch: { type: Boolean, default: false },
}, { _id: false });

// Acciones de un jugador, elegir movimiento o cambiar de chilemon
type ActionKind = "move" | "switch";
interface IActionBase { kind: ActionKind; userId: Types.ObjectId; }
export interface IActionMove extends IActionBase { kind: "move"; moveId: number; }
export interface IActionSwitch extends IActionBase { kind: "switch"; toIndex: number; }

export type IAction = IActionMove | IActionSwitch;
const ActionSchema = new Schema<IAction>({
    kind: { type: String, enum: ["move","switch"], required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    moveId: { type: Number },
    toIndex: { type: Number },

})

// Interfaz principal de Battle (1v1)
export interface IBattle extends Document {
  players: [IPlayer, IPlayer];
  field?: { weather?: { kind: "none"|"rain"|"sun"|"sand"|"hail"; turnsLeft?: number };
            terrain?: { kind: "none"|"electric"|"grassy"|"misty"|"psychic"; turnsLeft?: number } }; // Para la primera gen no hay terrenos igualmente
  turn: number;
  actions: IAction[];
  log: string[];
  winner?: mongoose.Types.ObjectId;
  status: "waiting"|"in-progress"|"finished";
}

// Esquema principal de Battle
const BattleSchema = new Schema<IBattle>({
  players: { type: [PlayerSchema], required: true },
  field: { type: Schema.Types.Mixed, default: {} },
  turn: { type: Number, default: 1 },
  actions: { type: [ActionSchema], default: [] },
  log: { type: [String], default: [] },
  winner: { type: Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["waiting","in-progress","finished"], default: "waiting" },
}, { timestamps: true });

export default mongoose.model<IBattle>("Battle", BattleSchema);