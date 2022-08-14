const { logInfo } = require('../common.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        // register every table
        const allModels = Array.from(client.models.values(), wrapper => wrapper['model']);
        allModels.forEach(model => model.sync());
        logInfo(`Ready! Logged is as ${client.user.tag}`);
    },
};