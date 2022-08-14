const { logError } = require('../common.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`${logError} - Error thrown: '${error}'`);
            await interaction.reply({ content: `Hubo un error al ejecutar el comando. ${error}`, ephemeral: true });
        }
    },
};