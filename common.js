const moment = require("moment");
const stringSimilarity = require("string-similarity");
const { SubjectGivenNotClearError } = require('./exceptions.js');

const logDate = moment().format();
const logInfo = `INFO - ${logDate}`;
const logError = `ERROR - ${logDate}`;

const RATING_ACCEPTANCE_RATE = 0.4;

const getSubjectName = async (subject, interaction) => {
    const Subject = interaction.client.models.get('Subject').model;
    
    const allSubjects = await Subject.findAll();
    const allSubjectsNames = [...allSubjects].map(s => s.dataValues.name);

    const subjectWithRomanLetters = subject.replace('1', 'I').replace('2', 'II').replace('3', 'III');
    const matches = stringSimilarity.findBestMatch(subjectWithRomanLetters.toString(), allSubjectsNames);
    const nameMatched = matches.bestMatch.target;
    const matchRating = matches.bestMatch.rating;

    if (matchRating < RATING_ACCEPTANCE_RATE) {
        throw SubjectGivenNotClearError(); 
    }
    
    return nameMatched;
}

const getAllRecordsOf = async (model, subjectName, interaction) => {
    const Model = interaction.client.models.get(model).model;
    const Subject = interaction.client.models.get('Subject').model;

    const wantedSubject = await Subject.findOne({ where: { name: subjectName } });
    console.log(`${logInfo} - Requesting ${model.toLowerCase()} for '${wantedSubject.name}'`);
    
    const allRecords = await Model.findAll({ where: { SubjectId: wantedSubject.id }});
    return allRecords;
}

module.exports = {
    logInfo,
    logError,
    getSubjectName,
    getAllRecordsOf
};