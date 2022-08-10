const Sequelize = require('sequelize');

module.exports = {
    name: 'summaries',
    register(client) {
        return client.sequelize.define(this.name, {
            name: {
                type: Sequelize.STRING,
                unique: true,
            },
            subject: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'subjects'
                }
            },
            file: Sequelize.BLOB,
            description: Sequelize.TEXT,
        });
    },
};