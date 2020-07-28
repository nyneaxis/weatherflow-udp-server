require('log-timestamp');

const {
    createDateTime
} = require("./helpers");

exports.logMessage = (message, level) => {
    if (level == "error") {
        console.error(message);
        return;

    }

    if (level == "info") {
        console.info(message);
        return;

    }

    console.log(message);

}