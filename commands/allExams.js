const { SlashCommandBuilder, bold } = require('discord.js');
const { logInfo, logError, getSubjectName, getAllRecordsOf, recordInfoUtils } = require('../common.js');
const { NoExamsFoundError } = require('../exceptions.js');

const commandSchema = new SlashCommandBuilder()
        .setName('parciales')
        .setDescription('Te da todos los parciales existentes de una materia.')
        .addStringOption(option =>
            option.setName('materia')
            .setDescription('La materia que querés buscar.')    
                .setRequired(true)
        );

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

            const allFiles = allMatchedExams.map(final => {
                const finalURL = recordInfoUtils.getRecordURL(final);
                return { attachment: finalURL };
            });
            
            const replyMessage = `${bold(fullSubjectName.toUpperCase())}\nEncontré ${finals.length} parciales en total. Tenés para rato. :)`;

            await interaction.deferReply();
            await interaction.editReply({
                files: allFiles,
                content: replyMessage,
            });
                
            console.log(`${logInfo} - Successfully sent ${finals.length} exams`);
        } catch(error) {
            console.error(`${logError} - Info: ${error}, command: /parciales`);
            interaction.reply({ content: `Hubo un error al buscar los parciales, ${interaction.user}: ${error}`, ephemeral: true });
        }
    },
};