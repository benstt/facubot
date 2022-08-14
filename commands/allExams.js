const { SlashCommandBuilder, bold } = require('discord.js');
const { logInfo, logError, getSubjectName, getAllRecordsOf, recordInfoUtils, getYearOfRecord, getAsMoment } = require('../common.js');
const { NoExamsFoundError, NoExamsFromYearError } = require('../exceptions.js');

const commandSchema = new SlashCommandBuilder()
        .setName('parciales')
        .setDescription('Te da todos los parciales existentes de una materia.')
        .addStringOption(option =>
            option.setName('materia')
            .setDescription('La materia que querés buscar.')    
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('año')
                .setDescription('El año en el que fueron tomados.')
                .setRequired(false)
        );

const getExamsFromYear = (year, allExams) => {
    const allExamsFromYear = allExams.filter(e => getYearOfRecord(e) == year) || [];
    return allExamsFromYear;
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

            let exams = allMatchedExams;

            // if the user decided to look for a specific year, search for it and get all its exams
            if (year) {
                logInfo(`Trying to get all exams from ${year}`);
                exams = getExamsFromYear(year, allMatchedExams);
                if (exams.length == 0) {
                    logInfo(`No exams found from ${year}, returning`);
                    throw NoExamsFromYearError(year);
                }
            }

            const allFiles = exams.map(exams => {
                const examURL = recordInfoUtils.getRecordURL(exams);
                return { attachment: examURL };
            });
            
            const replyMessage =
                (year) ?
                `${bold(fullSubjectName.toUpperCase())}\nEncontré ${exams.length} parciales del ${bold(year)}. Usalos sabiamente.` :
                `${bold(fullSubjectName.toUpperCase())}\nEncontré ${exams.length} parciales en total. Tenés para rato. :)`;

            await interaction.deferReply();
            await interaction.editReply({
                files: allFiles,
                content: replyMessage,
            });
                
            logInfo(`Successfully sent ${exams.length} exams`);
        } catch(error) {
            logError(`Info: '${error}', command: /parciales`);
            interaction.reply({ content: `Hubo un error al buscar los parciales, ${interaction.user}: ${error}`, ephemeral: true });
        }
    },
};