const Sequelize = require('sequelize');

module.exports = {
    name: 'Subject',
    schema: {
        name: {
            type: Sequelize.STRING,
            unique: true,
        },
        year: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    }
};