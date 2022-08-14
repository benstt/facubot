const { SlashCommandBuilder } = require('discord.js');

const commandSchema = new SlashCommandBuilder()
        .setName('resumen')
        .setDescription('Te da el resumen de una materia.')
        .addStringOption(option =>
            option.setName('materia')
                .setDescription('La materia que querés buscar.')
                .setRequired(true)
        );

module.exports = {
    data: commandSchema,
    async execute(interaction) {
        // const materia = interaction.options.get('materia')['value'];
        interaction.reply(`Todavia no hice este comando. Mepa que es medio al pedo.`);
    },
};