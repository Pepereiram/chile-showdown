import { useState } from "react";
import { Plus, X, Save, Home, Ellipsis } from "lucide-react";
import "./TeamBuilder.css"; // <-- extracted styles
import eggkingImg from "../assets/HuevitoRey.jpeg";
import corxeaImg from "../assets/corxea.jpg";
import misterionImg from "../assets/misterion.jpg";
import papiMickeyImg from "../assets/papiMickey.jpg";




// Minimal Tailwind remains for icon sizing only. Layout/visual styles moved to CSS classes.

const samplePlayers = [
  { id: 1, name: "EggKing", avatar: eggkingImg },
  { id: 2, name: "Corxea", avatar: corxeaImg },
  { id: 3, name: "Misterion", avatar: misterionImg },
  { id: 4, name: "PapiMickey", avatar: papiMickeyImg },
];

function PlayerCard({ player, onRemove }: { player: (typeof samplePlayers)[number]; onRemove?: () => void }) {
  return (
    <div className="playerCard">
      {onRemove && (
        <button className="playerCard__remove" onClick={onRemove} aria-label={`Remove ${player.name}`}>
          <X className="icon-16" />
        </button>
      )}
      <div className="playerCard__avatar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={player.avatar} alt={player.name} />
      </div>
      <div className="playerCard__name">{player.name}</div>
      <button className="btn btn--primary btn--xs">Edit</button>
    </div>
  );
}

function AddPlayerCard({ onAdd }: { onAdd: () => void }) {
  return (
    <button onClick={onAdd} className="addCard" aria-label="Add player">
      <div className="addCard__ring">
        <Plus className="icon-40" />
      </div>
    </button>
  );
}

export default function TeamBuilder() {
  const [teams, setTeams] = useState([
    { id: 1, name: "Team 1", players: [...samplePlayers] },
    { id: 2, name: "Team 2", players: [] },
    { id: 3, name: "Team 3", players: [] },
  ]);

  const [activeTeamId, setActiveTeamId] = useState(1);

  const activeTeam = teams.find((t) => t.id === activeTeamId)!;

  const updateTeam = (id: number, updater: (t: (typeof teams)[number]) => (typeof teams)[number]) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? updater({ ...t }) : t)));
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <button className="header__home">
          <Home className="icon-16" />
          <span>Home</span>
        </button>
        <div className="header__title">Chilemon Showdown</div>
        <div className="header__spacer" />
      </div>

      {/* Content */}
      <div className="content">
        {/* Left panel */}
        <aside className="leftPanel">
          <div className="leftPanel__title">Teams</div>
          <div className="leftPanel__list">
            {teams.map((team, idx) => (
              <div key={team.id} className="teamItem">
                <button
                  onClick={() => setActiveTeamId(team.id)}
                  className={`teamButton ${activeTeamId === team.id ? "teamButton--active" : ""}`}
                >
                  <div className="teamButton__index">{idx + 1}.</div>
                  <div className="teamButton__avatars">
                    {team.players.slice(0, 5).map((p) => (
                      <img key={p.id} src={p.avatar} alt={p.name} className="teamButton__avatar" />
                    ))}
                    <button className={`teamButton__add ${activeTeamId === team.id ? "teamButton__add--active" : ""}`} aria-label="Add">
                      <Plus className="icon-14" />
                    </button>
                  </div>
                </button>
              </div>
            ))}

            <div className="pager">
              <span />
              <span />
              <span />
            </div>
          </div>
        </aside>

        {/* Right panel */}
        <main className="rightPanel">
          <div className="rightPanel__top">
            <div className="rightPanel__teamName">{activeTeam.name}</div>
            <div className="rightPanel__actions">
              <input
                className="input_teamBuilder"
                placeholder="Ponle un nombre a tu equipo..."
                value={activeTeam.name}
                onChange={(e) => updateTeam(activeTeam.id, (t) => ({ ...t, name: e.target.value }))}
              />
              <button className="btn btn--sky btn--icon">
                <Save className="icon-16" />
              </button>
            </div>
          </div>

          <div className="playersGrid">
            {activeTeam.players.slice(0, 5).map((p) => (
              <PlayerCard
                key={p.id}
                player={p}
                onRemove={() =>
                  updateTeam(activeTeam.id, (t) => ({ ...t, players: t.players.filter((pp) => pp.id !== p.id) }))
                }
              />
            ))}
            <AddPlayerCard
              onAdd={() =>
                updateTeam(activeTeam.id, (t) => ({
                  ...t,
                  players: [
                    ...t.players,
                    {
                      id: Math.max(0, ...t.players.map((pp) => pp.id)) + 1,
                      name: `Player ${t.players.length + 1}`,
                      avatar: `https://i.pravatar.cc/120?img=${(t.players.length % 70) + 1}`,
                    },
                  ],
                }))
              }
            />
          </div>

          <div className="more">
            <button className="more__btn">
              <Ellipsis className="icon-16" />
              <span>More</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}


