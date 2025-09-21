const path = require("path");

// Helpers para cargar JSON
const load = (p) => require(path.join(__dirname, "data", p));

module.exports = () => ({
  chilemon: load("chilemon.json"),
  users: load("users.json"),
  teams: load("teams.json"),
  teamPokemon: load("teamPokemon.json"), // relación N..M con orden
  pokemon,
  moves: load("moves.json"),
  abilities: load("abilities.json")
});
