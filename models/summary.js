const Sequelize = require('sequelize');

module.exports = {
    name: 'Summary',
    schema: {
        file: Sequelize.TEXT
    },
    belongsTo: ['Subject'],
};