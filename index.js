const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { logInfo } = require('./common.js');
const subjectsData = require('./subjects.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let token = '';

let sequelize = undefined;
if (process.env.DB_ENVIRONMENT) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false
            }
          }
    });

    token = process.env.DISCORD_TOKEN;
} else {
    sequelize = new Sequelize('database', 'user', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        storage: 'database.sqlite',
    });

    token = require('./config.json')['token'];
}

const queryInterface = sequelize.getQueryInterface();

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

// // get all files under /models
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

const getDatabaseModel = name => {
    const models = [...client.models.values()];
    return models.find(wrapper => wrapper['fields']['name'] === name).model;
}

const registerRelationships = async () => {
    // register relationships
    for (const [_, modelWrapper] of client.models) {
        const fields = modelWrapper.fields;
        if (fields.hasOwnProperty('hasOne')) {
            for (const field of fields['hasMany']) {
                const model = client.models.get(field).model;
                modelWrapper.model.hasOne(model);
                await model.sync({ alter: true });
            }
        }

        if (fields.hasOwnProperty('hasMany')) {
            for(const field of fields['hasMany']) {
                const model = client.models.get(field).model;
                modelWrapper.model.hasMany(model);
                await model.sync({ alter: true });
            }
        }
        

        if (fields.hasOwnProperty('belongsTo')) {
            for (const field of fields['belongsTo']) {
                const model = client.models.get(field).model;
                modelWrapper.model.hasOne(model);
                await model.sync({ alter: true });
            }
        }
    }
}

const Subjects = getDatabaseModel('Subjects');
queryInterface.tableExists('Subjects').then(exists => {
    if (!exists) return;

    registerRelationships().then(() => {
        // create every subject entry
        subjectsData.forEach(async s => {
            // check if the subject we want to create exists before trying to create it again
            const subjectExists = await Subjects.findOne({ where: { name: s['name'] }});
            if (subjectExists) {
                return;
            }

            await Subjects.create({
                name: s["name"],
                year: s["year"],
                bachelors: s["bachelors"],
                bachelorsSpecific: (s["bachelorsSpecific"]) ? true : false,
                elective: (s["elective"]) ? true : false,
            });
        });
    })

    logInfo('Successfully initialized database');
});

client.login(token);