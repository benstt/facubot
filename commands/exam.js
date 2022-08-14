const { SlashCommandBuilder, inlineCode, bold } = require('discord.js');
const { logInfo, logError, getSubjectName, getAllRecordsOf, recordInfoUtils } = require('../common.js');
const { NoExamsFoundError } = require('../exceptions.js');

const commandSchema = new SlashCommandBuilder()
        .setName('parcial')
        .setDescription('Te da un parcial de una materia.')
        .addStringOption(option =>
            option.setName('materia')
                .setDescription('La materia que querés buscar.')    
                .setRequired(true)
        );

module.exports = {
    data: commandSchema,
    async execute(interaction) {
        const subject = interaction.options.get('materia')['value'];
        try {
            const fullSubjectName = await getSubjectName(subject, interaction);
            const allMatchedExams = await getAllRecordsOf('Exams', fullSubjectName, interaction);
            if (allMatchedExams.length == 0) {
                throw NoExamsFoundError(fullSubjectName); 
            }
            
            // get a random exam
            const exam = allMatchedExams[Math.floor(Math.random() * allMatchedExams.length)]
            const examYear = recordInfoUtils.getRecordDate(exam).format('YYYY');
            const examURL = recordInfoUtils.getRecordURL(exam);
            const examUploadUser = recordInfoUtils.getUserWhoUploaded(exam);
            const message = (examYear < 2010) ?
                `${bold(fullSubjectName.toUpperCase())}\nEncontré un parcial de andá a saber cuándo, ahora ponete a estudiar. Subido por ${inlineCode(examUploadUser)}.` :
                `${bold(fullSubjectName.toUpperCase())}\nEncontré un parcial del ${examYear}, ahora ponete a estudiar. Subido por ${inlineCode(examUploadUser)}.`;


            await interaction.deferReply();
            await interaction.editReply({
                files: [{
                    attachment: examURL,
                }],
                content: message 
            });
            console.log(`${logInfo} - Successfully sent exam`);
        } catch(error) {
            console.error(`${logError} - Info: '${error}', command: /parcial`);
            interaction.reply({ content: `Hubo un error al buscar un parcial, ${interaction.user}: ${error}`, ephemeral: true });
        }
    },
};