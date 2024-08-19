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

client.on('interactionCreate', async interaction => {
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
                content: `Last Math Data: \n\nMap: ${result.map}\nType: ${result.type}\nServer: ${result.server}\n\nBlue Team: \n${result.blueTeam.join('\n')}\n\nRed Team: \n${result.redTeam.join('\n')} \n\nWinning Team: ${result.winningTeam}`,
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
});

client.login(process.env.DISCORD_TOKEN)

client.on('messageCreate', async (message) => {   // listen to texts
    const message_content = message.content;

    // if (!message?.author?.bot) {
    //     message.reply(`${message.author} said: ${message_content}`);
    // }

    if (!message?.author?.bot && message_content.startsWith('!botJoin')) {
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
});
