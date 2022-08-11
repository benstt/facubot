const Sequelize = require('sequelize');

module.exports = {
    name: 'Final',
    schema: {
        date: {
            type: Sequelize.DATEONLY,
            allowNull: true,
        },
        fileURL: Sequelize.TEXT,
    },
    fk: 'Subject'
};