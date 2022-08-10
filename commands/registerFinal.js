const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { SlashCommandBuilder } = require('discord.js');

const getContentsOfFile = async (file, interaction) => {
    try {
        const response = await fetch(file);

        if (!response.ok) {
            interaction.reply(`Hubo un error al leer el archivo. Mensaje: ${response.statusText}`);
            return;
        }
        
        // wait for the response
        const text = await response.text();
        if (text) {
            return text;
        }
    } catch (err) {
        throw err;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('registrar_final')
        .setDescription('Registra el final de una materia. El archivo debe ser enviado junto con el mensaje.')
        .addStringOption(option =>
            option.setName('materia')
                .setDescription('La materia que querés buscar.')    
                .setRequired(true)
        )
        .addAttachmentOption(attachment =>
            attachment.setName('archivo')
                .setDescription('El archivo a registrar.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const getOption = option => interaction.options.get(option);

        const subject = getOption('materia')['value'];
        const attachedURL = getOption('archivo')['attachment']['url'];
        const response = getContentsOfFile(attachedURL);
        // TODO: add file to database
        response.then(contents => {
            interaction.reply(`Se registra final de la materia ${subject}\nContenidos: ${contents}`);
        });
    },
};