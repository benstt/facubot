const Sequelize = require('sequelize');

module.exports = {
    name: 'Exams',
    schema: {
        date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
        fileURL: Sequelize.TEXT,
        SubjectId: Sequelize.INTEGER,
        uploadUser: Sequelize.STRING,
    },
    belongsTo: ['Subjects'],
};