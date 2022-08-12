const Sequelize = require('sequelize');

module.exports = {
    name: 'Exam',
    schema: {
        date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
        fileURL: Sequelize.TEXT,
        SubjectId: Sequelize.INTEGER,
        uploadUser: Sequelize.STRING,
    },
    belongsTo: ['Subject'],
};