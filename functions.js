import axios from 'axios'
import env from 'dotenv'

env.config();

export { valorantID, valorantMatch };

const API_URL = "https://api.henrikdev.xyz/valorant";
const API_KEY = process.env.API_KEY;

async function valorantID(name, tag) {
    console.log(`name: ${name}, tag: ${tag}`);
    try {
        const response_1 = await axios.get(`${API_URL}/v2/account/${name}/${tag}`, {
            params: {
                api_key: API_KEY,
            },
        });

        const region = response_1.data.data.region;
        const platform = response_1.data.data.platforms[0];
        const account_level = response_1.data.data.account_level;

        try {
            const response_2 = await axios.get(`${API_URL}/v3/mmr/${region}/${platform}/${name}/${tag}`, {
                params: {
                    api_key: API_KEY,
                },
            });

            const peak_id = response_2.data.data.peak.season.short;
            const peak_rank = response_2.data.data.peak.tier.name;
            const current_rank = response_2.data.data.current.tier.name;

            // const generated_message = `\nAccount: ${name}#${tag}\nRegion: ${region}\nPlatform: ${platform}\nAccount level: ${account_level}\nPeak ACT: ${peak_id}\nPeak Rank: ${peak_rank}\nCurrent Rank: ${current_rank}`

            const generated_message = {
                account: `${name}#${tag}`,
                region: region,
                platform: platform,
                accountLevel: account_level,
                peakAct: peak_id,
                peakRank: peak_rank,
                currentRank: current_rank
            }

            console.log(generated_message);
            console.log("\n\n\n");

            return generated_message;

        } catch (error) {
            console.error('Error fetching data:', error.message);
            return "Error fetching data";
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return "Error fetching data";
    }
}

async function valorantMatch(name, tag) {
    console.log(`name: ${name}, tag: ${tag}`);
    try {
        const response_1 = await axios.get(`${API_URL}/v2/account/${name}/${tag}`, {
            params: {
                api_key: API_KEY,
            },
        });

        const region = response_1.data.data.region;
        const platform = response_1.data.data.platforms[0];

        try {
            const response = await axios.get(`https://api.henrikdev.xyz/valorant/v4/matches/${region}/${platform}/${name}/${tag}`, {
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

            let teams = lastMatch.teams;
            let winningTeam;
            let winningRounds;
            let losingRounds;
            let rank = null;

            teams.forEach(team => {
                if (team.won) {
                    winningTeam = team.team_id;
                    winningRounds = team.rounds.won;
                    losingRounds = team.rounds.lost;
                }
            })

            players.forEach(player => {
                let playerName = player.name;
                let playerTag = player.tag;
                let team = player.team_id;
                let agent = player.agent.name;
                let kills = player.stats.kills;
                let deaths = player.stats.deaths;
                let assists = player.stats.assists;

                if (type == "Competitive") {
                    rank = player.tier.name;
                }

                if (team == 'Blue') {
                    blueTeam.push(`${playerName}#${playerTag} --- ${agent} --- KDA: ${kills}/${deaths}/${assists} ${rank ? "--- " + rank : ""}`);
                } else {
                    redTeam.push(`${playerName}#${playerTag} --- ${agent} --- KDA: ${kills}/${deaths}/${assists} ${rank ? "--- " + rank : ""}`);
                }
            });

            // const generatedMessage = `Last Math Data: \n\nMap: ${map}\nType: ${type}\nServer: ${server}\n\nBlue Team: \n${blueTeam.join('\n')}\n\nRed Team: \n${redTeam.join('\n')} \n\nWinning Team: ${winningTeam}`;

            const generatedMessage = {
                map: map,
                type: type,
                server: server,
                blueTeam: blueTeam,
                redTeam: redTeam,
                winningTeam: winningTeam,
                winningRounds: winningRounds,
                losingRounds: losingRounds,
            };

            console.log(generatedMessage);

            return generatedMessage;

        } catch (error) {
            console.error('Error fetching data:', error.message);
            return "Error fetching data";
        }
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return "Error fetching data";
    }
}