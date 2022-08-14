const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');

let clientId = '', guildId = '', token = '';
if (process.env.DB_ENVIRONMENT) {
	clientId = process.env.DISCORD_CLIENT_ID;
	guildId = process.env.DISCORD_GUILD_ID;
	token = process.env.DISCORD_TOKEN;
} else {
	clientId = require('./config.json')['clientId'];
	guildId = require('./config.json')['guildId'];
	token = require('./config.json')['token'];
}

const rest = new REST({ version: '10' }).setToken(token);

rest.delete(Routes.applicationGuildCommand(clientId, guildId, '1006642705381740596'))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);