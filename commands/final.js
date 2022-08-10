const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('final')
        .setDescription('Te da el final de una materia.')
        .addStringOption(option =>
            option.setName('materia')
                .setDescription('La materia que querés buscar.')    
                .setRequired(true)
        ),
    async execute(interaction) {
        const materia = interaction.options.get('materia')['value'];
        await interaction.reply(`Se busca final de la materia ${materia}`);
    },
};