const Influx = require("influx");
const fs = require("fs");

let config = {};

fs.readFile("./config/config.json", "utf8", function (err, data) {
    if (err) {
        console.log(err);
    }
    config = JSON.parse(data);
});

exports.mongodbInsertDocument = (obj) => {

}

exports.influxDBPublish = (fields, measurement, data) => {
    const influx = new Influx.InfluxDB({
        host: config.influxDBHost,
        database: config.influxDBName,
        schema: [{
            measurement: measurement,
            fields: fields,
            tags: ["station_id"]
        }],
    });

    influx.getDatabaseNames().then((names) => {
        if (!names.includes(config.influxDBName)) {
            return influx.createDatabase(config.influxDBName);
        }

        influx
            .writePoints([{
                measurement: measurement,
                tags: {
                    station_id: "23340"
                },
                fields: data,
                timestamp: data.timestamp,
            }])
            .catch((err) => {
                console.error(`Error saving data to InfluxDB! ${err.stack}`);
            });
    });
}