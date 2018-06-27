var express = require('express');
var app = express();

var models = require('./models');
var api = require('./api');


app.get('/import-league/:lc', function (req, res) {
  
  var lc = req.params.lc;

  models.League.findOne({
    where: {league: lc}
  }).then(league => {

    if (league) {
      res.status(409).json({message: 'League already imported'});
    } else {

      api.getLeague(lc).then(league => {

        if (league) {

          models.League.findOrCreate({
            where: {
              league: league.league
            },
            defaults: {
              year: league.year,
              caption: league.caption
            }
          }).spread((dbLeague, created) => {

            for(var i in league.teams) {

              var team = league.teams[i];

              models.Team.findOrCreate({
                where: {
                  code: team.id
                },
                defaults: {
                  name: team.name,
                  shortName: team.shortName
                }
              }).spread((newTeam, created) => {

                if (created){
                  newTeam.addLeague(dbLeague);

                  for(var j in league.players[newTeam.code]) {
                    var player = league.players[newTeam.code][j];
                    models.Player.findOrCreate({
                      where: {
                        id: player.id
                      },
                      defaults: {
                        name: player.name,
                        position: player.position,
                        jerseyNumber: player.jerseyNumber,
                        dateOfBirth: player.dateOfBirth,
                        nationality: player.nationality,
                        contractUntil: player.contractUntil,
                        teamId: newTeam.id
                      }
                    })
                  }
                }
              });
            }
          });

          res.status(201).json({message: 'Successfully imported'});

        } else {
          res.status(404).json({message: 'Not found'});
        }

      }, (error) => {
        res.status(504).json(error);
        res.status(504).json({message: 'Server Error'});
      })
    }
  });
});


app.get('/total-players/:lc', function (req, res) {
  
  models.League.findOne({
    where: {league: req.params.lc}
  }).then(league => {

    if (league) {

      league.getTeams({attributes: ['id']}).then(teams => {

        var ids = teams.reduce((acc, team) => {
          acc.push(team.id);
          return acc
        },[]);

        var data = {
          total : 0
        };

        if (ids.length) {

          models.Player.count({ where: { teamId: {[models.op.in]: ids}} }).then(c => {
            data.total = c;
            res.status(200).json(data);
          })
        } else {
          res.status(200).json(data);
        }  
      })

    } else {
      res.status(404).end();
    }
  });
});




//Running migrations if needed
models.db.sync().then(function(){
  var port = process.env.APP_PORT || '3000';
  app.listen(port, function () {
    console.log('Application Started');
  });
});




