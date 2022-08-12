const stringSimilarity = require("string-similarity");
const { SlashCommandBuilder, inlineCode, bold } = require('discord.js');
const { logInfo, logError } = require('../common.js');

const RATING_ACCEPTANCE_RATE = 0.4;

const getFinalDate = final => {
    return final.dataValues.date;
}

const getFinalURL = final => {
    return final.dataValues.fileURL;
}

const getUserWhoUploaded = final => {
    return final.dataValues.uploadUser;
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

const getAllFinalsOf = async (subjectName, interaction) => {
    const Final = interaction.client.models.get('Final').model;
    const Subject = interaction.client.models.get('Subject').model;

    const wantedSubject = await Subject.findOne({ where: { name: subjectName } });
    console.log(`${logInfo} - Requesting final for '${wantedSubject.name}'`);
    
    // console.log(`${logInfo} - Successfully sent final`);
    const allFinals = await Final.findAll({ where: { SubjectId: wantedSubject.id }});
    return allFinals;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('final')
        .setDescription('Te da un final de una materia.')
        .addStringOption(option =>
            option.setName('materia')
                .setDescription('La materia que querés buscar.')    
                .setRequired(true)
        ),
    async execute(interaction) {
        const subject = interaction.options.get('materia')['value'];
        try {
            // TODO: let the user pick what final to choose
            const fullSubjectName = await getSubjectName(subject, interaction);
            const allMatchedFinals = await getAllFinalsOf(fullSubjectName, interaction);
            const firstEntry = allMatchedFinals[0];
            const finalDate = new Date(getFinalDate(firstEntry)).getFullYear();
            const finalURL = getFinalURL(firstEntry);
            const finalUploadUser = getUserWhoUploaded(firstEntry);
            const message = (finalDate < 2010) ?
                `${bold(fullSubjectName.toUpperCase())}\n\nEncontré un final de andá a saber cuándo, ahora ponete a estudiar. Subido por ${inlineCode(finalUploadUser)}.` :
                `${bold(fullSubjectName.toUpperCase())}\n\nEncontré un final del ${finalDate}, ahora ponete a estudiar. Subido por ${inlineCode(finalUploadUser)}.`;

            interaction.reply({
                files: [{
                    attachment: finalURL,
                }],
                content: message 
            });
        } catch(error) {
            console.error(`${logError} - Info: ${error}, command: /final`);
            interaction.reply({ content: `Hubo un error al buscar un final, ${interaction.user}: ${error}`, ephemeral: true });
        }
    },
};