import axios from 'axios';
import tableify from 'tableify'

const API_URL = "https://api.henrikdev.xyz/valorant";
const API_KEY = "HDEV-ef3d9a21-3d43-4f97-be92-590d84b738f1";
const name = "m4d";
const tag = "7972";

async function getValorantAccount() {
    try {
        const response = await axios.get(`https://api.henrikdev.xyz/valorant/v4/matches/ap/pc/iskatulJahan/irina`, {
            params: {
                api_key: API_KEY,
            },
        });

        let lastMatch = response.data.data[0];
        let map = lastMatch.metadata.map.name;
        let type = lastMatch.metadata.queue.name;
        let server = lastMatch.metadata.cluster;

        let players = lastMatch.players;
        let blueTeam = [];
        let redTeam = [];
        let blueTeamData = [];
        let redTeamData = [];

        let teams = lastMatch.teams;
        let winningTeam;

        teams.forEach(team => {
            if (team.won) {
                winningTeam = team.team_id;
            }
        })

        console.log(winningTeam);

        players.forEach(player => {
            let playerName = player.name;
            let playerTag = player.tag;
            let team = player.team_id;
            let agent = player.agent.name;
            let kills = player.stats.kills;
            let deaths = player.stats.deaths;
            let assists = player.stats.assists;

            let kda = `${kills}/${deaths}/${assists}`

            if (team == 'Blue') {
                blueTeamData.push([`${playerName}#${playerTag}`, agent, kda]);
            } else {
                redTeamData.push([`${playerName}#${playerTag}`, agent, kda]);
            }
        });

        const generatedMessage = `Last Math Data: \nMap: ${map}\nType: ${type}\nServer: ${server}\n\nBlue Team: \n${tableify(blueTeamData)}\n\nRed Team: \n${tableify(redTeamData)}`;

        console.log(generatedMessage);
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
}

getValorantAccount();
