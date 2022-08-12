const { SlashCommandBuilder, inlineCode, bold } = require('discord.js');
const { logInfo, logError, getSubjectName, getAllRecordsOf } = require('../common.js');
const { NoFinalsFoundError, NoFinalsFromYearError } = require('../exceptions.js');
const moment = require('moment');

const getFinalDate = final => {
    return moment(final.dataValues.date, 'YYYY-MM-DD');
}

const getFinalURL = final => {
    return final.dataValues.fileURL;
}

const getUserWhoUploaded = final => {
    return final.dataValues.uploadUser;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('final')
        .setDescription('Te da un final de una materia.')
        .addStringOption(option =>
            option.setName('materia')
                .setDescription('La materia que querés buscar.')    
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('año')
                .setDescription('El año en el que fue tomado.')
                .setRequired(false)
        ),
    async execute(interaction) {
        const getOption = option => interaction.options.get(option);

        try {
            const subject = getOption('materia')['value'];

            let datePassed = undefined;
            if (getOption('año')) {
                const year = getOption('año')['value'];
                datePassed = moment(year, 'YYYY-MM-DD');
            }

            // TODO: let the user pick what final to choose
            const fullSubjectName = await getSubjectName(subject, interaction);
            const allMatchedFinals = await getAllRecordsOf('Final', fullSubjectName, interaction);
            if (allMatchedFinals.length == 0) {
                throw NoFinalsFoundError(fullSubjectName);
            }

            // gets a random final as a default!
            let final = allMatchedFinals[Math.floor(Math.random() * allMatchedFinals.length)];
            
            // if the user decided to look for a specific year, search for it
            if (datePassed) {
                const getYearOfFinal = final => getFinalDate(final).format('YYYY');
                const yearPassed = datePassed.format('YYYY');
                console.log(`${logInfo} - Trying to request a final from ${yearPassed}`);

                finalIndex = allMatchedFinals.findIndex(f => getYearOfFinal(f) == yearPassed);

                if (finalIndex != -1) {
                    console.log(`${logInfo} - Found final`);
                    final = allMatchedFinals[finalIndex];
                } else {
                    console.log(`${logInfo} - No final found, returning`);
                    throw NoFinalsFromYearError(yearPassed);
                }
            }

            const finalDate = getFinalDate(final).format('YYYY');
            const finalURL = getFinalURL(final);
            const finalUploadUser = getUserWhoUploaded(final);
            const replyMessage = 
                (finalDate < 2010) ?
                `${bold(fullSubjectName.toUpperCase())}\n\nAgarré un final al azar de andá a saber cuándo, ahora ponete a estudiar. Subido por ${inlineCode(finalUploadUser)}.` :
                (datePassed) ?
                `${bold(fullSubjectName.toUpperCase())}\n\nEncontré este final del ${bold(datePassed.format('YYYY'))}! Ahora ponete a estudiar. Subido por ${inlineCode(finalUploadUser)}.` :
                `${bold(fullSubjectName.toUpperCase())}\n\nAgarré un final al azar. Este es del ${finalDate}, ahora ponete a estudiar. Subido por ${inlineCode(finalUploadUser)}.`;

            await interaction.reply({
                files: [{
                    attachment: finalURL,
                }],
                content: replyMessage,
            });

            console.log(`${logInfo} - Successfully sent final`);
        } catch(error) {
            console.error(`${logError} - Info: ${error}, command: /final`);
            interaction.reply({ content: `Hubo un error al buscar un final, ${interaction.user}: ${error}`, ephemeral: true });
        }
    },
};