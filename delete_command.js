const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(token);

rest.delete(Routes.applicationGuildCommand(clientId, guildId, '1006642705381740596'))
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);