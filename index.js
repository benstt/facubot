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

const queryInterface = sequelize.getQueryInterface();

client.commands = new Collection();
client.models = new Collection();
client.subjects = new Collection();
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

// register relationships
for (const [_, modelWrapper] of client.models) {
    const fields = modelWrapper.fields;
    if (fields.hasOwnProperty('hasOne')) {
        fields['hasOne'].forEach(f => {
            const model = client.models.get(f).model;
            modelWrapper.model.hasOne(model);
        });
    }

    if (fields.hasOwnProperty('hasMany')) {
        fields['hasMany'].forEach(f => {
            const model = client.models.get(f).model;
            modelWrapper.model.hasMany(model);
        });
    }

    if (fields.hasOwnProperty('belongsTo')) {
        fields['belongsTo'].forEach(f => {
            const model = client.models.get(f).model;
            modelWrapper.model.hasOne(model);
        });
    }
}

const getDatabaseModel = name => {
    const models = [...client.models.values()];
    return models.filter(wrapper => wrapper['fields']['name'] === name)[0].model;
}

const subjectsData = require('./subjects.json');
const Subject = getDatabaseModel('Subject');
const subjectTableExists = queryInterface.tableExists('Subjects');

if (subjectTableExists) {
    subjectsData.forEach(async s => {
        // const subjectExists = await Subject.findOne({ where: { year: 1}});
        // console.log(subjectExists);
    
        // const subject = await Subject.create({
        //     name: s["name"],
        //     year: s["year"],
        //     bachelors: s["bachelors"],
        //     bachelorsSpecific: (s["bachelorsSpecific"]) ? true : false,
        //     elective: (s["elective"]) ? true : false,
        // });
    
        // const subjectName = subject.dataValues.name;
        // client.subjects.set(subjectName, subject);
    });
}

client.login(token);