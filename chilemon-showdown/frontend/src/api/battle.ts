// src/api/battles.ts
import { apiFetch } from "./client";

export async function getBattleById(battleId: number) {
  return apiFetch(`battles/${battleId}`);
}

export async function getAllBattles() {
  return apiFetch("battles");
}
