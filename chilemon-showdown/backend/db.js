const path = require("path");

// Helpers para cargar JSON
const load = (p) => require(path.join(__dirname, "data", p));

module.exports = () => ({
  chilemon: load("chilemon.json"),
  users: load("users.json"),
  teams: load("teams.json"),
  teamChilemon: load("teamChilemon.json"),
  moves: load("moves.json"),
});
