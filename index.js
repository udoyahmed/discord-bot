import env from 'dotenv'
import { Client, GatewayIntentBits, REST, Routes, GuildMember } from 'discord.js'
import { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { Player, QueryType, useMainPlayer } from "discord-player";
import { valorantID, valorantMatch } from './functions.js';
import { commands } from './commands.js';

env.config()

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

const player = new Player(client);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on('interactionCreate', async interaction => {      // listen to interactions (commands)
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }

    if (interaction.commandName === 'valorantid') {
        try {
            await interaction.deferReply();

            const name = interaction.options.getString('name');
            const tag = interaction.options.getString('tag');

            const result = await valorantID(name, tag);

            await interaction.editReply({
                content: `Account: ${result.account}\nRegion: ${result.region}\nPlatform: ${result.platform}\nAccount level: ${result.accountLevel}\nPeak ACT: ${result.peakAct}\nPeak Rank: ${result.peakRank}\nCurrent Rank: ${result.currentRank}`,
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred while processing your request.');
        }
    }

    if (interaction.commandName === 'valorantmatch') {
        try {
            await interaction.deferReply();

            const name = interaction.options.getString('name');
            const tag = interaction.options.getString('tag');

            const result = await valorantMatch(name, tag);

            await interaction.editReply({
                content: `${name}#${tag}'s Last Match Data: \n\nMap: ${result.map}\nType: ${result.type}\nServer: ${result.server}\n\nBlue Team: \n${result.blueTeam.join('\n')}\n\nRed Team: \n${result.redTeam.join('\n')} \n\nWinning Team: ${result.winningTeam} (${result.winningRounds}:${result.losingRounds})`,
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred while processing your request.');
        }
    }

    if (interaction.commandName === 'botjoin') {
        try {
            await interaction.deferReply();

            if (interaction.member.voice.channel) {
                const connection = joinVoiceChannel({
                    channelId: interaction.member.voice.channel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                await interaction.editReply('Joined!');
            } else {
                await interaction.editReply('You are not in a voice channel!');
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred while processing your request.');
        }
    }
    if (interaction.commandName === 'botleave') {
        try {
            await interaction.deferReply();

            const connection = getVoiceConnection(interaction.guild.id);

            if (connection) {
                connection.destroy();  // Disconnects the bot from the voice channel
                await interaction.editReply('Left the voice channel!');
            } else {
                await interaction.editReply('I am not in a voice channel!');
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('An error occurred while processing your request.');
        }
    }
    if (interaction.commandName === 'baati') {
        await interaction.deferReply();

        let baatiContext = `As Apon (Real_Warrior) gets triggered when the word "baati" is used, 
        Reshad has taken an initiative to overuse the word.`;

        await interaction.editReply(baatiContext);
    }
});

client.login(process.env.DISCORD_TOKEN)

client.on('messageCreate', async (message) => {   // listen to texts
    const messageContent = message.content;

    // if (!message?.author?.bot) {
    //     message.reply(`${message.author} said: ${message_content}`);
    // }

    if (!message?.author?.bot && messageContent.startsWith('!botJoin')) {
        if (message.member.voice.channel) {
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
            });
            message.reply('Joined!');
        } else {
            message.reply('You are not in a voice channel!');
        }
    }
    if (!message?.author?.bot && messageContent.startsWith('!botLeave')) {
        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();  // Disconnects the bot from the voice channel
            message.reply('Left the voice channel!');
        } else {
            message.reply('I am not in a voice channel!');
        }
    }
    if (!message?.author?.bot && messageContent.startsWith('!valorantid')) {
        const nameTag = messageContent.replace('!valorantid ', '');
        const arr = nameTag.split('#');
        try {
            const result = await valorantID(arr[0], arr[1]);

            const generatedMessage = `Account: ${result.account}\nRegion: ${result.region}\nPlatform: ${result.platform}\nAccount level: ${result.accountLevel}\nPeak ACT: ${result.peakAct}\nPeak Rank: ${result.peakRank}\nCurrent Rank: ${result.currentRank}`

            message.reply(generatedMessage);
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while processing your request.');
        }
    }
    if (!message?.author?.bot && messageContent.startsWith('!valorantmatch')) {
        const nameTag = messageContent.replace('!valorantmatch ', '');
        const arr = nameTag.split('#');
        try {
            const result = await valorantMatch(arr[0], arr[1]);

            const generatedMessage = `${arr[0]}#${arr[1]}'s Last Match Data: \n\nMap: ${result.map}\nType: ${result.type}\nServer: ${result.server}\n\nBlue Team: \n${result.blueTeam.join('\n')}\n\nRed Team: \n${result.redTeam.join('\n')} \n\nWinning Team: ${result.winningTeam} (${result.winningRounds}:${result.losingRounds})`

            message.reply(generatedMessage);
        } catch (error) {
            console.error(error);
            message.reply('An error occurred while processing your request.');
        }
    }
});
