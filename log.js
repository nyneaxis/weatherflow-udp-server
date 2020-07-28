const {
    createDateTime
} = require("./helpers");

exports.logMessage = (message, level) => {
    if (level == "error") {
        console.error(createDateTime(Date.now()) + ": " + message);
        return;

    }

    if (level == "info") {
        console.info(createDateTime(Date.now()) + ": " + message);
        return;

    }

    console.log(createDateTime(Date.now() + ": " + message));

}