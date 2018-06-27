require('dotenv').config()
var axios = require('axios');

const api = axios.create({
  baseURL: 'http://api.football-data.org/v1/',
  headers: {
    'X-Auth-Token': process.env.API_KEY,
    'X-Response-Control': 'minified'
  }
});

var exports = module.exports = {}


exports.getLeague = (code) => {

  return new Promise((resolve, reject) => {


    api.get('competitions').then(
      (response) => {

        var league = response.data.find(league => {
          return league.league == code;
        });

        if (league) {

          api.get('competitions/'+league.id+'/teams').then(
            (response) => {

              var teams_loaded = 0;
              league.teams = response.data.teams;
              league.players = {};

              for(var i in league.teams){
                var team = league.teams[i];
                api.get('teams/'+team.id+'/players',{
                  headers: {
                    tid : team.id
                  }
                }).then(
                  (response) => {
                    var tid = response.config.headers.tid;
                    league.players[tid] = response.data.players;
                    teams_loaded++;

                    if (teams_loaded == league.teams.length) {
                      return resolve(league);
                    }

                  }, (error) =>{
                    return reject(error);
                  }
                );
              }
            },
            (error) => {
              return reject(error);
            }
          );
        } else {
          return resolve(false);
        }
      },
      (error) => {
        return reject(error);
      }
    );

  });

}

