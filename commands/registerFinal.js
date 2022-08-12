const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const stringSimilarity = require("string-similarity");
const { SlashCommandBuilder, bold } = require('discord.js');
const { logInfo, logError } = require('../common.js');
const { InvalidFinalDateError, InvalidFinalFieldError, SubjectGivenNotClearError } = require('../exceptions.js');

const RATING_ACCEPTANCE_RATE = 0.4;

const registerFinal = async (subject, attachmentURL, date, interaction) => {
    try {
        const Final = interaction.client.models.get('Final').model;
        const Subject = interaction.client.models.get('Subject').model;

        // get all subjects out of the database
        const allSubjects = await Subject.findAll();
        const allSubjectsNames = [...allSubjects].map(s => s.dataValues.name);

        // convert numbers into roman letters
        // if the user inputs 'II' it will search for the first match, being 'I',
        // therefore registering the wrong subject.
        // it should be enough having I, II and III though.
        const subjectWithRomanLetters = subject.replace('1', 'I').replace('2', 'II').replace('3', 'III');

        // find the subject wanted out of all subjects
        const matches = stringSimilarity.findBestMatch(subjectWithRomanLetters.toString(), allSubjectsNames);
        const nameMatched = matches.bestMatch.target;
        const matchRating = matches.bestMatch.rating;

        if (matchRating < RATING_ACCEPTANCE_RATE) {
            throw SubjectGivenNotClearError();
        }
        
        const uploadUserName = `${interaction.user.username}#${interaction.user.discriminator}`;
        const subjectMatched = await Subject.findOne({ where: { name: nameMatched }})
        const final = await Final.create({
            date: date || new Date(),
            fileURL: attachmentURL,
            uploadUser: uploadUserName,
        });
        
        // assign relationships
        await final.setSubject(subjectMatched);
        await subjectMatched.addFinal(final);
        
        console.log(`${logInfo} - Added final for subject ${subjectMatched.name} to the database.`);
        interaction.reply(`Diganle gracias a ${interaction.user} que agregó un final de ${bold(subjectMatched.name)} a la base de datos. 🎉`);
    } catch (error) {
        console.error(`${logError} - Info: ${error}, command: /registrar_final`);
        interaction.reply({ content: `Hubo un error al registrar el final, ${interaction.user}: ${error}`, ephemeral: true });
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
                .setDescription('Año en el que fue tomado el final.')    
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
                throw InvalidFinalDateError();
            }
    
            registerFinal(subject, attachedURL, date, interaction);
        } catch (error) {
            console.error(`${logError} - Info: ${error}`);
            throw InvalidFinalFieldError();
        }
    },
};