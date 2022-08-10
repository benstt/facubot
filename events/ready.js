module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        // register every table
        client.models.forEach(model => model.sync());
        console.log(`Ready! Logged is as ${client.user.tag}`);
    },
};