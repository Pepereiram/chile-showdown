const path = require("path");

// Helpers para cargar JSON
const load = (p) => require(path.join(__dirname, "data", p));

// Puedes mantener por generaciones y luego unir
const pokemon = [
  ...load("pokemon/gen1.json"),
  // ...load("pokemon/gen2.json"),
  // ...load("pokemon/gen3.json"),
];

module.exports = () => ({
  users: load("users.json"),
  teams: load("teams.json"),
  teamPokemon: load("teamPokemon.json"), // relación N..M con orden
  pokemon,
  moves: load("moves.json"),
  abilities: load("abilities.json")
});
