const stringSimilarity = require("string-similarity");
const { SlashCommandBuilder, bold } = require('discord.js');
const { logInfo, logError } = require('../common.js');

const RATING_ACCEPTANCE_RATE = 0.4;

const registerExam = async (subject, attachmentURL, date, interaction) => {
    try {
        const Exam = interaction.client.models.get('Exam').model;
        const Subject = interaction.client.models.get('Subject').model;

        // get all subjects out of the database
        const allSubjects = await Subject.findAll();
        const allSubjectsNames = [...allSubjects].map(s => s.dataValues.name);

        const subjectWithRomanLetters = subject.replace('1', 'I').replace('2', 'II').replace('3', 'III');

        // find the subject wanted out of all subjects
        const matches = stringSimilarity.findBestMatch(subjectWithRomanLetters.toString(), allSubjectsNames);
        const nameMatched = matches.bestMatch.target;
        const matchRating = matches.bestMatch.rating;

        if (matchRating < RATING_ACCEPTANCE_RATE) {
            throw 'Es difícil saber a qué materia te referís. Por favor, tratá de poner el nombre completo.';
        }
        
        const uploadUserName = `${interaction.user.username}#${interaction.user.discriminator}`;
        const subjectMatched = await Subject.findOne({ where: { name: nameMatched }})
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
        console.error(`${logError} - Info: ${error}, command: /registrar_exam`);
        interaction.reply({ content: `Hubo un error al registrar el parcial, ${interaction.user}: ${error}`, ephemeral: true });
    }
}

module.exports = {
    data: new SlashCommandBuilder()
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
        ),
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
                throw 'Fecha no válida, ingresá solo el año del parcial.';
            }
    
            registerExam(subject, attachedURL, date, interaction);
        } catch (error) {
            console.error(`${logError} - Info: ${error}`);
            throw 'Checkeá que hayas puesto bien todos los campos (y tratá de no usar abreviaciones para las materias!).';
        }
    },
};