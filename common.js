const moment = require("moment");
const stringSimilarity = require("string-similarity");
const { SubjectGivenNotClearError } = require('./exceptions.js');

const logDate = moment().format();
const logInfo = `INFO - ${logDate}`;
const logError = `ERROR - ${logDate}`;

const RATING_ACCEPTANCE_RATE = 0.4;

/// General utils for records.
const recordInfoUtils = {
    getRecordDate(record) {
        return moment(record.dataValues.date, 'YYYY-MM-DD');
    },
    getRecordURL(record) {
        return record.dataValues.fileURL;
    },
    getUserWhoUploaded(record) {
        return record.dataValues.uploadUser;
    }
}

/// Finds matches of a string out of an array of strings,
/// and fails if the match is not very accurate.
const findMatch = (wanted, all) => {
    // convert numbers into roman letters
    // if the user inputs 'II' it will search for the first match, being 'I',
    // therefore registering the wrong subject.
    // it should be enough having I, II and III though.
    const wantedWithRomanLetters = wanted.replace('1', 'I').replace('2', 'II').replace('3', 'III');
    const matches = stringSimilarity.findBestMatch(wantedWithRomanLetters.toString(), all);
    const nameMatched = matches.bestMatch.target;
    const matchRating = matches.bestMatch.rating;

    // there was probably a misspelling of the word
    if (matchRating < RATING_ACCEPTANCE_RATE) {
        throw SubjectGivenNotClearError(); 
    }
    
    return nameMatched;
}

/// Gets the most accurate match of a string in comparison with
/// the name of the records in the database.
const getSubjectName = async (subject, interaction) => {
    const Subjects = interaction.client.models.get('Subjects').model;
    
    // get all subjects out of the database
    const allSubjects = await Subjects.findAll();
    const allSubjectsNames = [...allSubjects].map(s => s.dataValues.name);

    return findMatch(subject, allSubjectsNames);
}

/// Gets all records of the model passed existing.
const getAllRecordsOf = async (model, subjectName, interaction) => {
    const Model = interaction.client.models.get(model).model;
    const Subjects = interaction.client.models.get('Subjects').model;

    const wantedSubject = await Subjects.findOne({ where: { name: subjectName } });
    console.log(`${logInfo} - Requesting ${model.toLowerCase()}(s) for '${wantedSubject.name}'`);
    
    // get all the records that are linked to the subject wanted
    const allRecords = await Model.findAll({ where: { SubjectId: wantedSubject.id }});
    return allRecords;
}

/// Gets the year of a given record.
const getYearOfRecord = record => recordInfoUtils.getRecordDate(record).format('YYYY');

/// Gets the date given as a moment.
const getAsMoment = date => {
    if (!date) return;
    return moment(date, 'YYYY-MM-DD');
}

module.exports = {
    logInfo,
    logError,
    findMatch,
    getSubjectName,
    getAllRecordsOf,
    getYearOfRecord,
    getAsMoment,
    recordInfoUtils
};