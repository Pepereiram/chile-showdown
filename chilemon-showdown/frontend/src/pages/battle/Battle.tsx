import {useState, useRef} from "react";
import { HealthBar } from "../../components/HealthBar";
import { useParams } from "react-router-dom";
import type { HealthBarHandle } from "../../components/HealthBar";
export const Battle: React.FC = () => {
  const { battleId } = useParams<{ battleId: string }>();
  console.log("Battle ID from params:", battleId);
  const ref = useRef<HealthBarHandle | null>(null);
  return (
    <div className="battle-view pd-100px">
      <h1>Battle Page</h1>
      <p>Current Battle ID: {battleId}</p>
      <HealthBar ref={ref} maxHealth={200} initial={200} position="top-right" />
      <HealthBar ref={ref} maxHealth={150} initial={150} position="bottom-left" />
      <button onClick={() => ref.current?.takeDamage(30)}>Recibir 30</button>
      <button onClick={() => ref.current?.heal(20)}>Curar 20</button>
    </div>
  );
};
