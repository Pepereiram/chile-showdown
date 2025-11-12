import { IPlayer, IBattle, IAction, IActionMove } from "../../models/battle";
import { ITeamChilemon } from "../../models/teamChilemon";
import Battle from "../../models/battle";
import { Types } from "mongoose";
import { BaseStats } from "./battleHelpers";


import * as battleHelpers from "./battleHelpers";

const SWITCH_PRIORITY = 7; // Prioridad de la acción de cambiar Chilemon, así es superior a cualquier movimiento

function asObjectId(id: string | Types.ObjectId) {
  return typeof id === "string" ? new Types.ObjectId(id) : id;
}

export class BattleEngine {

    // Inicializa el estado de batalla para cada jugador
    async initializeBattle(battle: IBattle) {
        for (const p of battle.players) {
            p.partyState = await battleHelpers.initializePartyState(p.team); // ← usa especie
            p.activeIndex = 0;
            p.mustSwitch = false;
        }
        battle.status = "in-progress";
        battle.turn = 1;
        battle.log.push("¡La batalla comenzó!");
    }

    /** 
     * Registrar accion de cada jugador
     */

    async submitMove(battle: IBattle, userId: string, moveId: number, target: number) {
        battle.actions.push({ kind: "move", userId: asObjectId(userId), moveId, target});
        await this.tryResolveTurn(battle)
    }

    async submitSwitch(battle: IBattle, userId: string, toIndex: number) {
        battle.actions.push({ kind: "switch", userId: asObjectId(userId), toIndex });
        await this.tryResolveTurn(battle)
    }

    // Intenta resolver el turno si ambos jugadores han enviado su acción
    private async tryResolveTurn(battle: IBattle) {
        const [p1, p2] = battle.players;
        const action1 = battle.actions.find(a => a.userId.equals(p1.userId));
        const action2 = battle.actions.find(a => a.userId.equals(p2.userId));
        if (!action1 || !action2) return;

        await this.resolveTurn(battle, action1, action2);
        battle.actions = [];    
        battle.turn += 1;
        battle.log.push(`--- Turno ${battle.turn - 1} resuelto ---`);

    }

    // Resuelve el turno actual basándose en las acciones de los jugadores
    private async resolveTurn(battle: IBattle, a1: IAction, a2: IAction) {
        const [p1, p2] = battle.players;
        const order = await this.compareActions(p1, a1, p2, a2);

        for (const step of order) {
            const atk = step.user === 1 ? p1 : p2;
            const def = step.user === 1 ? p2 : p1;
            const action = step.user === 1 ? a1 : a2;

            if (battle.status === "finished") break;
            await this.executeAction(battle, atk, def, action);
        }
    }

    private async executeAction(battle: IBattle, attacker: IPlayer, defender: IPlayer, action: IAction) {
        if (battleHelpers.isFainted(attacker) && action.kind !== "switch") return;

        if (action.kind === "switch") {
            battleHelpers.onSwitchIn(attacker, action.toIndex);
            attacker.mustSwitch = false;
            battle.log.push(`${attacker.username} cambió a Chilemon #${action.toIndex + 1}.`);
        return;
        }

        const move = battleHelpers.getMoveData(action.moveId);

        if (move.damage_class === "status") {
            battleHelpers.applyStatusMove(attacker, defender, move, battle.log);
            return;
        }

        // solo si es physical o special
        let baseAcc = 90; // Los moves en el json no tienen accuracy, por ahora asumimos 90 siempre
        const atkState = battleHelpers.getActiveStateOrThrow(attacker);
        const defState = battleHelpers.getActiveStateOrThrow(defender);
  
        // Fallo de movimiento
        if (!battleHelpers.rollToHit(baseAcc, atkState.stages.acc ?? 0, defState.stages.eva ?? 0)) {
            battle.log.push(`${attacker.username} usó ${move.name} pero falló.`);
            return;
        }

        // Aplicar daño
        const damage = await battleHelpers.applyDamage(attacker, defender, move);
        defState.currentHP = Math.max(0, defState.currentHP - damage);
        battle.log.push(`${attacker.username} usó ${move.name} e hizo ${damage} de daño.`);

        if (defState.currentHP <= 0) {
            battle.log.push(`${defender.username}'s Chilemon se debilitó.`);
            defState.currentHP = 0;

            if (!battleHelpers.hasAvailableMon(defender)) {
                battle.status = "finished";
                battle.winner = attacker.userId;
                battle.log.push(`${attacker.username} gana la batalla!`);
            } else {
                defender.mustSwitch = true;
                battle.log.push(`${defender.username} debe cambiar de Chilemon.`);
            }
        }
    }

    private async compareActions(p1: IPlayer, a1: IAction, p2: IPlayer, a2: IAction) {

        const key = async (p: IPlayer, a: IAction) => {
            if (a.kind === "switch") return { pri: SWITCH_PRIORITY, spe: 0 };
            const move = battleHelpers.getMoveData((a as IActionMove).moveId);
            const spe = await battleHelpers.getStat(p, "spe");
            return { pri: move.priority ?? 0, spe };
        };

        const k1 = await key(p1, a1);
        const k2 = await key(p2, a2);

        if (k1.pri !== k2.pri) return k1.pri > k2.pri ? [{ user: 1 }, { user: 2 }] : [{ user: 2 }, { user: 1 }];
        if (k1.spe !== k2.spe) return k1.spe > k2.spe ? [{ user: 1 }, { user: 2 }] : [{ user: 2 }, { user: 1 }];
        return Math.random() < 0.5 ? [{ user: 1 }, { user: 2 }] : [{ user: 2 }, { user: 1 }];
    }

}