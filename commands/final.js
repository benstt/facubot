const stringSimilarity = require("string-similarity");
const { SlashCommandBuilder } = require('discord.js');
const { logInfo, logError } = require('../common.js');

const RATING_ACCEPTANCE_RATE = 0.4;

const getAllFinalsOf = async (subject, interaction) => {
    try {
        const Final = interaction.client.models.get('Final').model;
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
    
        const wantedSubject = await Subject.findOne({ where: { name: nameMatched } });
        console.log(`${logInfo} - Requesting final for '${wantedSubject.name}'`);
        // console.log(wantedSubject.id);
        
        // const subjectId = subject.id;
        // console.log(Object.getOwnPropertyNames(Subject));
        const allFinals = await Final.findAll({ where: { SubjectId: wantedSubject.id }});
        console.log(allFinals);
        console.log(`${logInfo} - Successfully sent final`);
    } catch (error) {
        console.error(`${logError} - Info: ${error}, command: /final`);
        interaction.reply({ content: `Hubo un error al buscar un final, ${interaction.user}: ${error}`, ephemeral: true });
    }
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
        getAllFinalsOf(subject, interaction);
        // await interaction.reply(`Se busca final de la materia ${subject}`);
    },
};