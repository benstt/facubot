const Sequelize = require('sequelize');

module.exports = {
    name: 'subjects',
    register(client) {
        return client.sequelize.define(this.name, {
            name: {
                type: Sequelize.STRING,
                unique: true,
            },
            year: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            description: Sequelize.TEXT,
        });
    },
};