const Sequelize = require('sequelize');

module.exports = {
    name: 'Subjects',
    schema: {
        name: {
            type: Sequelize.STRING,
            unique: true,
        },
        year: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        // maybe create a model for this
        bachelors: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        bachelorsSpecific: Sequelize.BOOLEAN,
        elective: Sequelize.BOOLEAN,
    },
    hasMany: ['Finals', 'Summaries', 'Exams'],
};