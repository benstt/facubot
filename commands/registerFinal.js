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

const registerFinal = async (subject, attachmentURL, interaction) => {
    try {
        const Final = interaction.client.models.get('Final').model;
        const Subject = interaction.client.models.get('Subject').model;
        const estructuraDatos = await Subject.create({
            name: "Estructura de Datos",
            year: 2,
        });
        const finalEd = await Final.create({
            date: new Date(),
            fileURL: attachmentURL
        });
        await finalEd.setSubject(estructuraDatos);
        const materiaFinalEd = await finalEd.getSubject();
        console.log(`Materia del final: ${materiaFinalEd.name}`);
        
        interaction.reply(`Materia ${estructuraDatos.name} y final ${finalEd} creados.`);
    } catch (error) {
        console.log(error);
        interaction.reply('Hubo un error al registrar el final.');
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
        )
        .addStringOption(option =>
            option.setName('fecha')
                .setDescription('La fecha del final, en formato AAAA/MM/DD.')    
                .setRequired(false)
        ),
    async execute(interaction) {
        const getOption = option => interaction.options.get(option);

        const subject = getOption('materia')['value'];
        const attachedURL = getOption('archivo')['attachment']['url'];
        const date = new Date(getOption('fecha')['value']);
        console.log(date);
        // const response = getContentsOfFile(attachedURL);
        // TODO: add file to database
        registerFinal(subject, attachedURL, interaction);
        // response.then(contents => {
        //     interaction.reply(`Se registra final de la materia ${subject}`);
        // });
    },
};