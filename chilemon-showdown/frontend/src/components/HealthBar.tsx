// ...existing code...
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  type CSSProperties,
} from "react";

export interface HealthBarHandle {
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  setHealth: (value: number) => void;
  getHealth: () => number;
}

export type PositionKeyword = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface HealthBarProps {
  maxHealth: number;
  // Si se pasa `value` el componente funciona en modo controlado.
  value?: number;
  // Valor inicial si no es controlado
  initial?: number;
  // Ubicación: keywords o pasar clase css personalizada en `className`
  position?: PositionKeyword;
  className?: string;
  // offset en px para ajustar separación del borde (opcional)
  offset?: number;
  // estilo inline adicional
  style?: CSSProperties;
  // muestra etiqueta numérica (por defecto true)
  showLabel?: boolean;
  // duración de transición en ms
  transitionMs?: number;
}

function clamp(n: number, a = 0, b = 100) {
  return Math.max(a, Math.min(b, n));
}

const positionMap: Record<PositionKeyword, string> = {
  "top-left": "fixed top-4 left-4",
  "top-right": "fixed top-4 right-4",
  "bottom-left": "fixed bottom-4 left-4",
  "bottom-right": "fixed bottom-4 right-4",
};

export const HealthBar = forwardRef<HealthBarHandle, HealthBarProps>(
  (
    {
      maxHealth,
      value,
      initial,
      position = "top-left",
      className = "",
      offset = 16,
      style,
      showLabel = true,
      transitionMs = 300,
    },
    ref
  ) => {
    const normalizedMax = Math.max(1, Math.floor(maxHealth));
    const initialHealth = value ?? (initial ?? normalizedMax);
    const [health, setHealthState] = useState<number>(clamp((initialHealth / normalizedMax) * 100, 0, 100));

    // Sincroniza en modo controlado
    useEffect(() => {
      if (typeof value === "number") {
        setHealthState(clamp((value / normalizedMax) * 100, 0, 100));
      }
    }, [value, normalizedMax]);

    useImperativeHandle(ref, () => ({
      takeDamage(amount: number) {
        setHealthState((h) => clamp(h - (amount / normalizedMax) * 100, 0, 100));
      },
      heal(amount: number) {
        setHealthState((h) => clamp(h + (amount / normalizedMax) * 100, 0, 100));
      },
      setHealth(val: number) {
        setHealthState(clamp((val / normalizedMax) * 100, 0, 100));
      },
      getHealth() {
        return Math.round((health / 100) * normalizedMax);
      },
    }), [health, normalizedMax]);

    const containerPosClass = positionMap[position];
    const offsetStyle =
      position.startsWith("top")
        ? { marginTop: offset }
        : { marginBottom: offset };

    const pct = clamp(health, 0, 100);

    return (
      <div
        className={`${containerPosClass} z-50 ${className}`}
        style={{ ...offsetStyle, ...style } as React.CSSProperties}
        aria-hidden={false}
      >
        <div className="w-56 bg-gray-800 rounded-lg p-1 shadow-lg">
          <div
            className="w-full bg-gray-700 h-4 rounded-md overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={normalizedMax}
            aria-valuenow={Math.round((pct / 100) * normalizedMax)}
          >
            <div
              className="h-full bg-green-600 transition-all"
              style={{
                width: `${pct}%`,
                transitionDuration: `${transitionMs}ms`,
              }}
            />
          </div>
          {showLabel && (
            <div className="text-xs text-white mt-1 text-center select-none">
              {Math.round((pct / 100) * normalizedMax)} / {normalizedMax}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default HealthBar;
