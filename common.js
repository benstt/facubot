const moment = require("moment");
const logDate = moment().format();
const logInfo = `INFO - ${logDate}`;
const logError = `ERROR - ${logDate}`;

module.exports = {
    logInfo,
    logError
};