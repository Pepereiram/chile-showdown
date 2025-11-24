import moves from "../data/moves.json";

export function getMoveById(moveId: number) {
  return moves.find((move) => move.id === moveId) || null;
}

export function getMoveNameById(moveId: number): string | null {
  const move = getMoveById(moveId);
  return move ? (move.name ?? null) : null;
}

export function isPowerNull(moveId: number): boolean {
  const move = getMoveById(moveId);
  // If move is not found, treat as null (exclude it)
  if (!move) return true;
  return move.power === null;
}

