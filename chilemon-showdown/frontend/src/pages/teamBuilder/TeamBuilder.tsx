import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TeamBuilder.css";
import type { Chilemon } from "../../types/Chilemon";

interface PlayerDisplay {
  id: number;
  name: string;
  avatar: string;
}

interface ExistingTeam {
  id: number;
  name: string;
  members: PlayerDisplay[];
}

const TeamBuilder: React.FC = () => {
  const [teamName, setTeamName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerDisplay[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<PlayerDisplay[]>([]);
  const [error, setError] = useState("");
  const [existingTeams, setExistingTeams] = useState<ExistingTeam[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAvailableChilemon();
    loadExistingTeams();
  }, []);

  const auth = () => ({
    withCredentials: true,
    headers: { "X-CSRF-Token": localStorage.getItem("csrf") || "" },
  });

  const loadAvailableChilemon = async () => {
    try {
      const response = await axios.get<Chilemon[]>("http://localhost:3001/chilemon");
      const players: PlayerDisplay[] = response.data.map(chilemon => ({
        id: chilemon.id,
        name: chilemon.name,
        avatar: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${chilemon.id}.png`
      }));
      setAvailablePlayers(players);
    } catch (error) {
      console.error("Error loading Chilemon:", error);
      setError("Error al cargar los Chilemon disponibles.");
    }
  };

  const loadExistingTeams = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user) return;
      const teamsRes = await axios.get(`http://localhost:3001/api/teams`, auth());

      const teamsWithMembers = await Promise.all(
        teamsRes.data.map(async (team: any) => {
          const membersRes = await axios.get(`http://localhost:3001/api/teamChilemon`, {
            params: { teamId: team.id },
            ...auth(),
          });

          const chilemonRes = await axios.get<Chilemon[]>("http://localhost:3001/chilemon");

          const members = membersRes.data.map((m: any) => {
            const chilemon = chilemonRes.data.find(c => c.id === m.chilemonId);
            return chilemon ? {
              id: chilemon.id,
              name: chilemon.name,
              avatar: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${chilemon.id}.png`
            } : null;
          }).filter(Boolean);

          return {
            id: team.id,
            name: team.name,
            members: members
          };
        })
      );

      setExistingTeams(teamsWithMembers);
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  const handleSelectTeam = (team: ExistingTeam) => {
    setActiveTeamId(team.id);
    setTeamName(team.name);
    setSelectedPlayers(team.members);
    setIsCreatingNew(false);
    setError("");
  };

  const handleNewTeam = () => {
    setActiveTeamId(null);
    setTeamName("");
    setSelectedPlayers([]);
    setIsCreatingNew(true);
    setError("");
  };

  const handleAddPlayer = (player: PlayerDisplay) => {
    if (selectedPlayers.length >= 6) {
      setError("No puedes agregar más de 6 Chilemon a tu equipo.");
      return;
    }
    if (selectedPlayers.find(p => p.id === player.id)) {
      setError("Este Chilemon ya está en tu equipo.");
      return;
    }
    setSelectedPlayers([...selectedPlayers, player]);
    setError("");
  };

  const handleRemovePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
    setError("");
  };

  const handleDeleteTeam = async (teamId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Estás seguro de que quieres eliminar este equipo?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/teams/${teamId}`, auth());
      setExistingTeams(existingTeams.filter(t => t.id !== teamId));
      if (activeTeamId === teamId) {
        handleNewTeam();
      }
    } catch (error) {
      setError("Error al eliminar el equipo.");
    }
  };

  const handleSaveTeam = async () => {
    setError("");

    if (!teamName.trim()) {
      setError("Por favor, ingresa un nombre para tu equipo.");
      return;
    }

    if (selectedPlayers.length === 0) {
      setError("Debes agregar al menos un Chilemon a tu equipo.");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user) {
        setError("Debes iniciar sesión para crear un equipo.");
        return;
      }

      if (activeTeamId) {
        await axios.put(`http://localhost:3001/api/teams/${activeTeamId}`, {
          name: teamName,
          members: selectedPlayers.map(p => p.id)
        }, auth());
        alert("¡Equipo actualizado exitosamente!");
      } else {
        await axios.post("http://localhost:3001/api/teams", {
          name: teamName,
          members: selectedPlayers.map(p => p.id)
        }, auth());
        alert("¡Equipo creado exitosamente!");
      }

      setIsCreatingNew(false);
      await loadExistingTeams();
    } catch {
      setError("Error al guardar el equipo.");
    }
  };

  const teamSlots = Array(6).fill(null).map((_, index) => 
    selectedPlayers[index] || null
  );

  return (
    <div className="teambuilder-layout">
      <aside className="teams-sidebar">
        <h2 className="sidebar-title">Mis Equipos</h2>
        
        <button className="new-team-button" onClick={handleNewTeam}>
          + Crear Nuevo Equipo
        </button>

        <div className="teams-list">
          {existingTeams.length === 0 ? (
            <div className="no-teams">
              <p>No tienes equipos creados</p>
            </div>
          ) : (
            existingTeams.map(team => (
              <div
                key={team.id}
                className={`team-sidebar-item ${activeTeamId === team.id ? 'active' : ''}`}
                onClick={() => handleSelectTeam(team)}
              >
                <div className="team-sidebar-info">
                  <div className="team-sidebar-name">{team.name}</div>
                  <div className="team-sidebar-count">{team.members.length}/6 Chilemon</div>
                </div>
                <button
                  className="delete-sidebar-button"
                  onClick={(e) => handleDeleteTeam(team.id, e)}
                  title="Eliminar equipo"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <button className="back-button" onClick={() => navigate("/home")}>
          ← Volver al Home
        </button>
      </aside>

      <main className="teambuilder-main">
        <h1 className="title">
          {isCreatingNew || !activeTeamId ? 'Crear Nuevo Equipo' : 'Editar Equipo'}
        </h1>

        <div className="team-name-section">
          <input
            type="text"
            className="team-name-input"
            placeholder="Nombre del Equipo"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
          />
          <button className="save-button" onClick={handleSaveTeam} title="Guardar equipo">
            💾
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="team-grid">
          {teamSlots.map((player, index) => (
            <div key={index} className="team-slot">
              {player ? (
                <>
                  <img src={player.avatar} alt={player.name} className="slot-avatar" />
                  <div className="slot-name">{player.name}</div>
                  <button
                    className="slot-remove"
                    onClick={() => handleRemovePlayer(player.id)}
                    title="Remover"
                  >
                    ×
                  </button>
                  {/* <button className="slot-edit" title="Edit">
                    ✏️
                  </button> */}
                </>
              ) : (
                <div className="empty-slot">
                  <span className="empty-icon">+</span>
                  <span className="empty-text">Vacío</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <aside className="available-sidebar">
        <h3 className="section-title">Chilemon Disponibles</h3>
        <div className="available-list">
          {availablePlayers.map(player => (
            <div
              key={player.id}
              className={`available-card ${selectedPlayers.find(p => p.id === player.id) ? 'selected' : ''}`}
              onClick={() => handleAddPlayer(player)}
            >
              <img src={player.avatar} alt={player.name} />
              <div className="available-name">{player.name}</div>
              {!selectedPlayers.find(p => p.id === player.id) && (
                <div className="available-add">+</div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default TeamBuilder;


