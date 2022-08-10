const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

client.commands = new Collection();
client.models = new Collection();
client.sequelize = sequelize;

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const modelsPath = path.join(__dirname, 'models');
const modelFiles = fs.readdirSync(modelsPath).filter(file => file.endsWith('.js'));

// get all files under /events
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// get all files under /commands
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
}

// get all files under /models
for (const file of modelFiles) {
    const filePath = path.join(modelsPath, file);
    const model = require(filePath).register(client);

    client.models.set(model.name, model);
}

client.login(token);