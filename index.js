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
    const modelFields = require(filePath);
    const model = sequelize.define(modelFields.name, modelFields.schema);

    // Store the model itself + a reference to its fields,
    // consisting of the name + schema (SQL attrs) + optional fields,
    // like having foreign keys
    client.models.set(model.name, {
        model, 
        fields: modelFields
    });
}

// register foreign keys
for (const [_, modelWrapper] of client.models) {
    if (modelWrapper.fields.hasOwnProperty('fk')) {
        const foreignKeyName = modelWrapper.fields['fk'];
        const foreignKey = client.models.get(foreignKeyName).model;
        modelWrapper.model.hasOne(foreignKey);
    }
}

client.login(token);