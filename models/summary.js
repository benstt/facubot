const Sequelize = require('sequelize');

module.exports = {
    name: 'Summaries',
    schema: {
        fileURL: Sequelize.TEXT,
        SubjectId: Sequelize.INTEGER,
    },
    belongsTo: ['Subjects'],
};