const stringSimilarity = require("string-similarity");
const { SlashCommandBuilder, inlineCode, bold } = require('discord.js');
const { logInfo, logError } = require('../common.js');

const RATING_ACCEPTANCE_RATE = 0.4;

const getExamDate = exam => {
    return exam.dataValues.date;
}

const getExamURL = exam => {
    return exam.dataValues.fileURL;
}

const getUserWhoUploaded = exam => {
    return exam.dataValues.uploadUser;
}

const getSubjectName = async (subject, interaction) => {
    const Subject = interaction.client.models.get('Subject').model;
    
    const allSubjects = await Subject.findAll();
    const allSubjectsNames = [...allSubjects].map(s => s.dataValues.name);

    const subjectWithRomanLetters = subject.replace('1', 'I').replace('2', 'II').replace('3', 'III');
    const matches = stringSimilarity.findBestMatch(subjectWithRomanLetters.toString(), allSubjectsNames);
    const nameMatched = matches.bestMatch.target;
    const matchRating = matches.bestMatch.rating;

    if (matchRating < RATING_ACCEPTANCE_RATE) {
        throw 'Es difícil saber a qué materia te referís. Por favor, tratá de poner el nombre completo.';
    }
    
    return nameMatched;
}

const getAllExamsOf = async (subjectName, interaction) => {
    const Exam = interaction.client.models.get('Exam').model;
    const Subject = interaction.client.models.get('Subject').model;

    const wantedSubject = await Subject.findOne({ where: { name: subjectName } });
    console.log(`${logInfo} - Requesting exam for '${wantedSubject.name}'`);
    
    const allExams = await Exam.findAll({ where: { SubjectId: wantedSubject.id }});
    return allExams;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('parcial')
        .setDescription('Te da un parcial de una materia.')
        .addStringOption(option =>
            option.setName('materia')
                .setDescription('La materia que querés buscar.')    
                .setRequired(true)
        ),
    async execute(interaction) {
        const subject = interaction.options.get('materia')['value'];
        try {
            // TODO: let the user pick what exam to choose
            const fullSubjectName = await getSubjectName(subject, interaction);
            const allMatchedExams = await getAllExamsOf(fullSubjectName, interaction);
            if (allMatchedExams.length == 0) {
                throw `No se encontró ningún parcial de ${bold(fullSubjectName)}, por el momento.`
            }

            const firstEntry = allMatchedExams[0];
            const examDate = new Date(getExamDate(firstEntry)).getFullYear();
            const examURL = getExamURL(firstEntry);
            const examUploadUser = getUserWhoUploaded(firstEntry);
            const message = (examDate < 2010) ?
                `${bold(fullSubjectName.toUpperCase())}\n\nEncontré un parcial de andá a saber cuándo, ahora ponete a estudiar. Subido por ${inlineCode(examUploadUser)}.` :
                `${bold(fullSubjectName.toUpperCase())}\n\nEncontré un parcial del ${examDate}, ahora ponete a estudiar. Subido por ${inlineCode(examUploadUser)}.`;

            await interaction.reply({
                files: [{
                    attachment: examURL,
                }],
                content: message 
            });
            console.log(`${logInfo} - Successfully sent exam`);
        } catch(error) {
            console.error(`${logError} - Info: ${error}, command: /parcial`);
            interaction.reply({ content: `Hubo un error al buscar un parcial, ${interaction.user}: ${error}`, ephemeral: true });
        }
    },
};