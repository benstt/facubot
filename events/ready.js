module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        // register every table
        const allModels = Array.from(client.models.values(), wrapper => wrapper['model']);
        allModels.forEach(model => model.sync({ force: true }));
        console.log(`Ready! Logged is as ${client.user.tag}`);
    },
};