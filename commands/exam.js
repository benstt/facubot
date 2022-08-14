const { SlashCommandBuilder, inlineCode, bold } = require('discord.js');
const { logInfo, logError, getSubjectName, getAllRecordsOf, recordInfoUtils, getYearOfRecord, getAsMoment } = require('../common.js');
const { NoExamsFoundError, NoExamsFromYearError } = require('../exceptions.js');

const commandSchema = new SlashCommandBuilder()
        .setName('parcial')
        .setDescription('Te da un parcial de una materia.')
        .addStringOption(option =>
            option.setName('materia')
                .setDescription('La materia que querés buscar.')    
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('año')
                .setDescription('El año en el que fue tomado.')
                .setRequired(false)
        );

const getIndexOfExamFromYear = (year, allExams) => {
    const examFromYear = allExams.findIndex(e => getYearOfRecord(e) == year);
    return examFromYear;
}

module.exports = {
    data: commandSchema,
    async execute(interaction) {
        const getValueOf = option => {
            if (interaction.options.get(option) !== null)
                return interaction.options.get(option)['value'];
        };

        try {
            const subject = getValueOf('materia');
            const fullSubjectName = await getSubjectName(subject, interaction);
            const allMatchedExams = await getAllRecordsOf('Exams', fullSubjectName, interaction);
            if (allMatchedExams.length == 0) {
                throw NoExamsFoundError(fullSubjectName); 
            }

            const date = getAsMoment(getValueOf('año'));
            const year = (date) ? date.format('YYYY') : undefined;

            // gets a random exam as a default!
            let exam = allMatchedExams[Math.floor(Math.random() * allMatchedExams.length)];

            // if the user decided to look for a specific year, search for it
            if (year) {
                logInfo(`Trying to get an exam from ${year}`);
                examIndex = getIndexOfExamFromYear(year, allMatchedExams);

                if (examIndex != -1) {
                    logInfo('Found exam');
                    exam = allMatchedExams[examIndex];
                } else {
                    logInfo('No exam found, returning');
                    throw NoExamsFromYearError(year);
                }
            }
            
            const examYear = recordInfoUtils.getRecordDate(exam).format('YYYY');
            const examURL = recordInfoUtils.getRecordURL(exam);
            const examUploadUser = recordInfoUtils.getUserWhoUploaded(exam);
            const message =
                (year) ?
                `${bold(fullSubjectName.toUpperCase())}\nEncontré un parcial del ${examYear}, ahora ponete a estudiar. Subido por ${inlineCode(examUploadUser)}.` :
                (examYear < 2010) ?
                `${bold(fullSubjectName.toUpperCase())}\nEncontré un parcial de andá a saber cuándo, ahora ponete a estudiar. Subido por ${inlineCode(examUploadUser)}.` :
                `${bold(fullSubjectName.toUpperCase())}\nAgarré un parcial al azar. Este es del ${examYear}, ahora ponete a estudiar. Subido por ${inlineCode(examUploadUser)}.`;

            await interaction.deferReply();
            await interaction.editReply({
                files: [{
                    attachment: examURL,
                }],
                content: message 
            });
            logInfo('Successfully sent exam');
        } catch(error) {
            logError(`Info: '${error}', command: /parcial`);
            interaction.reply({ content: `Hubo un error al buscar un parcial, ${interaction.user}: ${error}`, ephemeral: true });
        }
    },
};