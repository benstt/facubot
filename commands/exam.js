const { SlashCommandBuilder, inlineCode, bold } = require('discord.js');
const { logInfo, logError, getSubjectName, getAllRecordsOf } = require('../common.js');
const { NoExamsFoundError } = require('../exceptions.js');

const getExamDate = exam => {
    return exam.dataValues.date;
}

const getExamURL = exam => {
    return exam.dataValues.fileURL;
}

const getUserWhoUploaded = exam => {
    return exam.dataValues.uploadUser;
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
            const allMatchedExams = await getAllRecordsOf('Exam', fullSubjectName, interaction);
            if (allMatchedExams.length == 0) {
                throw NoExamsFoundError(fullSubjectName); 
            }
            
            const exam = allMatchedExams[Math.floor(Math.random() * allMatchedExams.length)]
            const examDate = new Date(getExamDate(exam)).getFullYear();
            const examURL = getExamURL(exam);
            const examUploadUser = getUserWhoUploaded(exam);
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