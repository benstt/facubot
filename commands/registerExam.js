const { SlashCommandBuilder, bold } = require('discord.js');
const { logInfo, logError, getSubjectName } = require('../common.js');
const { InvalidExamDateError, InvalidFieldError } = require('../exceptions.js');

const commandSchema = new SlashCommandBuilder()
        .setName('registrar_parcial')
        .setDescription('Registra el parcial de una materia. El archivo debe ser enviado junto con el mensaje.')
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
                .setDescription('Año en el que fue tomado el parcial.')    
                .setRequired(false)
        );

/// Registers an exam on the database and asigns relationships with Subjects.
const registerExam = async (subject, attachmentURL, date, interaction) => {
    try {
        const Exam = interaction.client.models.get('Exams').model;
        const Subject = interaction.client.models.get('Subjects').model;
        
        const uploadUserName = `${interaction.user.username}#${interaction.user.discriminator}`;
        const subjectName = await getSubjectName(subject, interaction);
        const subjectMatched = await Subject.findOne({ where: { name: subjectName }});
        const exam = await Exam.create({
            date: date || new Date(),
            fileURL: attachmentURL,
            uploadUser: uploadUserName,
        });
        
        // assign relationships
        await exam.setSubject(subjectMatched);
        await subjectMatched.addExam(exam);
        
        console.log(`${logInfo} - Added exam for subject ${subjectMatched.name} to the database.`);

        interaction.reply(`${interaction.user} agregó un parcial de ${bold(subjectMatched.name)} a la base de datos. Gracias! 🥂`);
    } catch (error) {
        console.error(`${logError} - Info: ${error}, command: /registrar_parcial`);
        interaction.reply({ content: `Hubo un error al registrar el parcial, ${interaction.user}: ${error}`, ephemeral: true });
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
                throw InvalidExamDateError();
            }
    
            registerExam(subject, attachedURL, date, interaction);
        } catch (error) {
            console.error(`${logError} - Info: ${error}`);
            throw InvalidFieldError(); 
        }
    },
};