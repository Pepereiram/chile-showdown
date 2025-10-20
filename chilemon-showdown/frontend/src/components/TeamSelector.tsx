import { CiCirclePlus } from "react-icons/ci";

interface TeamSelectorProps {
  teams: Array<{ id: string; name: string; members: string[] }>;
  selectedTeamId: string | null;
  onChange: (id: string) => void;
}

function TeamSelector({ teams, selectedTeamId, onChange }: TeamSelectorProps) {
  const hasTeams = teams.length > 0;

  return (
    <div>
      <h3>Selecciona un equipo</h3>
      {!hasTeams && (
        <div className="flex items-center justify-center">
          <a href="/team-builder" title="Crear equipo">
            <CiCirclePlus className="icon-24 self-center size-8 hover:scale-110 transition" />
          </a>
        </div>
      )}
      {hasTeams && (
        <select
          value={selectedTeamId ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="border rounded px-3 py-1"
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default TeamSelector;