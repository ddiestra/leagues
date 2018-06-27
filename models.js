require('dotenv').config()
var Sequelize = require('sequelize');

var exports = module.exports = {}

var db = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

var League = db.define('league', {
  caption: Sequelize.STRING,
  league: Sequelize.STRING,
  year: Sequelize.INTEGER
});

var Team = db.define('team', {
  name: Sequelize.STRING,
  code: Sequelize.INTEGER,
  shortName: Sequelize.STRING
});

var Player = db.define('player', {
  name: Sequelize.STRING,
  position: Sequelize.STRING,
  jerseyNumber: Sequelize.INTEGER,
  dateOfBirth: Sequelize.DATE,
  nationality: Sequelize.STRING,
  contractUntil: Sequelize.DATE
});


League.belongsToMany(Team, {through: 'league_team'});
Team.belongsToMany(League, {through: 'league_team'});
Player.belongsTo(Team);

exports.db = db;
exports.League = League;
exports.Team = Team;
exports.Player = Player;
exports.op = Sequelize.Op;

