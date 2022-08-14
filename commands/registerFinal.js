const { SlashCommandBuilder, bold } = require('discord.js');
const { logInfo, logError, getSubjectName } = require('../common.js');
const { InvalidFinalDateError, InvalidFieldError } = require('../exceptions.js');

const commandSchema = new SlashCommandBuilder()
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
            option.setName('año')
                .setDescription('Año en el que fue tomado el final.')    
                .setRequired(false)
        );

/// Registers a final on the database and asigns relationships with Subjects.
const registerFinal = async (subject, attachmentURL, date, interaction) => {
    try {
        const Final = interaction.client.models.get('Finals').model;
        const Subject = interaction.client.models.get('Subjects').model;
        
        const uploadUserName = `${interaction.user.username}#${interaction.user.discriminator}`;
        const subjectName = await getSubjectName(subject, interaction);
        const subjectMatched = await Subject.findOne({ where: { name: subjectName }});
        const final = await Final.create({
            date: date || new Date(),
            fileURL: attachmentURL,
            uploadUser: uploadUserName,
        });
        
        // assign relationships
        await final.setSubject(subjectMatched);
        await subjectMatched.addFinal(final);
        
        console.log(`${logInfo} - Added final for subject ${subjectMatched.name} to the database.`);

        // interaction.deferReply();
        interaction.reply(`Diganle gracias a ${interaction.user} que agregó un final de ${bold(subjectMatched.name)} a la base de datos. 🎉`);
    } catch (error) {
        console.error(`${logError} - Info: ${error}, command: /registrar_final`);
        interaction.reply({ content: `Hubo un error al registrar el final, ${interaction.user}: ${error}`, ephemeral: true });
    }
}

module.exports = {
    data: commandSchema,
    async execute(interaction) {
        const getOption = option => interaction.options.get(option);

        try {
            const subject = getOption('materia')['value'];
            const attachedURL = getOption('archivo')['attachment']['url'];

            let dateString = '0';
            if (getOption('fecha')) {
                dateString = getOption('fecha')['value'] + '/';
            }
            const date = new Date(dateString);
            if (!date instanceof Date || isNaN(date)) {
                throw InvalidFinalDateError();
            }
    
            await registerFinal(subject, attachedURL, date, interaction);
        } catch (error) {
            console.error(`${logError} - Info: '${error}'`);
            throw InvalidFieldError();
        }
    },
};