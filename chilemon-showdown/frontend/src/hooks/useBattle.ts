// src/hooks/useBattle.ts
import { useEffect, useState } from "react";
import { getBattleById } from "../api/battle";

export function useBattle(battleId: number) {
  const [battle, setBattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getBattleById(battleId)
      .then(setBattle)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [battleId]);

  return { battle, loading, error };
}
