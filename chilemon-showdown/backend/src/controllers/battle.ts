import { Types } from "mongoose";
import Battle from "../models/battle";     
import TeamChilemon from "../models/teamChilemon";
import type { ITeamChilemon} from "../models/teamChilemon";   
import { IPlayer } from "../models/battle";
import User from "../models/users"
import Team from "../models/team"
import engine from "../services/battle/battleEngine";
import express from "express";
import { authenticate } from "../middleware/authMiddleware";
import type { IBattle } from "../models/battle";
// Carga el team del usuario (ajústalo a tu esquema real)
export async function loadTeamForUser(teamId: Types.ObjectId) {
    return TeamChilemon.find({ teamId }).exec();
}

// Construye el subdocumento Player
function makePlayer(userId: Types.ObjectId, username: string, team: ITeamChilemon[]): IPlayer {
  return {
    userId,
    username,
    team,                 // ITeamChilemon[]
    activeIndex: 0,
    partyState: [],       // se rellena en initializeBattle
    sideEffects: {},
    mustSwitch: false,
  };
}

const router = express.Router()

// Obtener la batalla correspondiente por ID
router.get("/battles/:id", authenticate, async (req, res) => {
    const {userId} = req.body;
    const battle = await Battle.findById(req.params.id);
    if (!battle) return res.status(404).json({ error: "Battle not found" });

    // validar que el usuario participa en esta battle
    const isPlayer = battle.players.some(p => p.userId.toString() === userId);
    if (!isPlayer) return res.status(403).json({ error: "No perteneces a esta batalla" });

    res.json(battle);
    
});

router.get("/:userId/battles", authenticate, async (req, res) => {
    const {userId} = req.params;
    if (!userId) {
        return res.status(400).json({ error: "userId es requerido" });
    }
    const battles: IBattle[] = await Battle.find({});
    console.log("All battles",battles);
    const userBattles = battles.filter(battle => 
        battle.players.some(p => p.userId.toString() === userId)
    );
    console.log("User battles for userId", userId, userBattles);
    res.json(userBattles);
});

// Crear instancia de la batalla
router.post("/battles", async (req, res) => { // IMPORTANTE: AGREGAR AUTENTICACIÓN
    const {userId, teamId} = req.body;
    const user = await User.findById(userId);
    const teamSelected = teamId // Desde el frontEnd pasar la id del equipo seleccionado
    const teamUser = await Team.findById(teamSelected)
    console.log("Team seleccionado:", teamUser);
    // Validaciones
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    if (!teamUser) {
        return res.status(404).json({ error: "Equipo no encontrado" });
    }
    if (teamUser.userId.toString() != user._id.toString()){
        return res.status(404).json({ error: "Equipo no pertenece a dicho usuario"})
    }

    const meId = user._id

    const waiting = await Battle.findOne({
        status: "waiting",
        "players.0.userId": { $ne: meId },
        "players.1": { $exists: false }
    }).exec();

    // Matchmaking, había alguien esperando batalla, nos unimos a esa
    if (waiting) {
        const newTeam = await loadTeamForUser(teamUser._id);
        const newUsername = user.username;
        const p2 = makePlayer(meId, newUsername, newTeam);
        
        waiting.players[1] = p2,
        waiting.status = "in-progress"
        waiting.turn = 0;
        
        await engine.initializeBattle(waiting);
        await waiting.save();
        return res.status(200).json(waiting);
    }

    // No hay nadie esperando batalla, se crea

    const myTeam = await loadTeamForUser(teamUser._id);
    const myUsername = user.username
    const p1 = makePlayer(meId, myUsername, myTeam);

    const battle = new Battle({
        status: "waiting",
        turn: 0,
        players: [p1],
        actions: [],
        log: []
    })

    await battle.save();
    return res.status(201).json(battle);
})

router.post("/battles/:id/move", authenticate, async (req, res) => {
    const {userId, moveId} = req.body;
    const battle = await Battle.findById(req.params.id).exec();
    if (!battle) return res.status(404).json({ error: "Battle not found" });

    // Identificar bien quien manda la acción
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const meId = user._id.toString()

    const moveIdNumber = Number(moveId);
    if (!Number.isFinite(moveIdNumber)) throw new Error("moveId inválido");

    await engine.submitMove(battle, meId, moveIdNumber);
    await battle.save();

    return res.json(battle);
})

router.post("/battles/:id/switch", authenticate, async (req, res) => {
    const {userId, toIndex} = req.body;

    const battle = await Battle.findById(req.params.id).exec();
    if (!battle) return res.status(404).json({ error: "Battle not found" });

    // Identificar bien quien manda la acción
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const meId = user._id.toString()

    const toIndexNumber = Number(toIndex);
    if (!Number.isFinite(toIndexNumber)) throw new Error("toIndex inválido");
    
    await engine.submitSwitch(battle, meId, toIndexNumber);
    await battle.save();

    return res.json(battle);
})


router.post("/battles/:id/forfeit", authenticate, async (req, res) => {
    const {userId} = req.body;
    const battle = await Battle.findById(req.params.id).exec();
    if (!battle) return res.status(404).json({ error: "Battle not found" });

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const meId = user._id; // Si en testing el "rival" al otro lado se rinde, y en pantalla se llega a mostrar que el usuario se rindio, debe ser por esto

    const rivalId = battle.players[0].userId.equals(meId)
            ? battle.players[1].userId
            : battle.players[0].userId;

    battle.status = "finished";
    battle.winner = rivalId;
    battle.log.push("El jugador se rindió.");
    await battle.save();

    res.json(battle);
})

export default router;