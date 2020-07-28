const dgram = require("dgram");
const server = dgram.createSocket("udp4");
const mongo = require("mongodb").MongoClient;
const assert = require("assert");
const Influx = require("influx");
const fs = require("fs");
require('log-timestamp');

//exports
const {
    decodeRapidWind,
    decodeObsSt
} = require("./decode");
const {
    createDateTime,
    calculateFeelsLikeTemp,
    calculateDewPoint,
    covertToFahrenheit,
} = require("./helpers");

const {
    influxDBPublish
} = require("./database");

let config = {};

fs.readFile("./config/config.json", "utf8", function (err, data) {
    if (err) {
        console.error("Error reading file");
    }
    console.info("Config file read");
    config = JSON.parse(data);

    fs.watchFile("./config/config.json", (curr, prev) => {
        console.info("Config file changed, loading new config file");
        fs.readFile("./config/config.json", "utf8", function (err, data) {
            config = JSON.parse(data);
        });

    });

    // Connection URL
    let url = "mongodb://" + config.mongoDBHost + ":" + config.mongoDBPort;
    const dbCollection = "house";

    const insertDocuments = function (db, doc, coll, callback) {
        // Get the documents collection
        const collection = db.collection(coll);
        try {
            // Insert some documents
            collection.insertMany([doc], function (err, result) {
                assert.equal(err, null);
                assert.equal(1, result.result.n);
                assert.equal(1, result.ops.length);
                //console.info("Inserted document into the collection");
                callback(result);
            });
        } catch (error) {
            console.error(error);
        }
    };

    server.on("message", (message) => {
        const msg = JSON.parse(message.toString());

        if (msg.type == "obs_st") {
            msg.obs = decodeObsSt(msg.obs[0]);
            msg.obs["feels_like"] = parseFloat(
                calculateFeelsLikeTemp(
                    msg.obs.temperature,
                    msg.obs.relative_humidity,
                    msg.obs.wind_avg
                ).toFixed(4)
            );
            msg.obs["dew_point"] = parseFloat(
                calculateDewPoint(msg.obs.temperature, msg.obs.relative_humidity).toFixed(
                    4
                )
            );

            console.info("Message: obs_st");

            let flattenObj = {
                timestamp: msg.obs.time,
                serial_number: msg.serial_number,
                wind_lull: msg.obs.wind_lull,
                wind_avg: msg.obs.wind_avg,
                wind_gust: msg.obs.wind_gust,
                wind_direction: msg.obs.wind_direction,
                wind_sample_interval: msg.obs.wind_sample_interval,
                station_pressure: msg.obs.station_pressure,
                temperature: msg.obs.temperature,
                relative_humidity: msg.obs.relative_humidity,
                illuminance: msg.obs.illuminance,
                uv: msg.obs.uv,
                solar_radiation: msg.obs.solar_radiation,
                rain_accumulated: msg.obs.rain_accumulated,
                precipitation_type: msg.obs.precipitation_type,
                lightning_strike_avg_distance: msg.obs.lightning_strike_avg_distance,
                lightning_strike_count: msg.obs.lightning_strike_count,
                battery: msg.obs.battery,
                report_interval: msg.obs.report_interval,
                feels_like: msg.obs.feels_like,
                dew_point: msg.obs.dew_point,
                firmware_revision: msg.firmware_revision,
            };

            let fields = {
                timestamp: Influx.FieldType.INTEGER,
                serial_number: Influx.FieldType.STRING,
                wind_lull: Influx.FieldType.FLOAT,
                wind_avg: Influx.FieldType.FLOAT,
                wind_gust: Influx.FieldType.FLOAT,
                wind_direction: Influx.FieldType.INTEGER,
                wind_sample_interval: Influx.FieldType.INTEGER,
                station_pressure: Influx.FieldType.FLOAT,
                temperature: Influx.FieldType.FLOAT,
                relative_humidity: Influx.FieldType.FLOAT,
                illuminance: Influx.FieldType.INTEGER,
                uv: Influx.FieldType.FLOAT,
                solar_radiation: Influx.FieldType.INTEGER,
                rain_accumulated: Influx.FieldType.FLOAT,
                precipitation_type: Influx.FieldType.INTEGER,
                lightning_strike_avg_distance: Influx.FieldType.FLOAT,
                lightning_strike_count: Influx.FieldType.INTEGER,
                battery: Influx.FieldType.FLOAT,
                report_interval: Influx.FieldType.INTEGER,
                feels_like: Influx.FieldType.FLOAT,
                dew_point: Influx.FieldType.FLOAT,
                firmware_revision: Influx.FieldType.INTEGER,
            };

            if (config.influxDBHost) {
                console.info("Sending event to InfluxDB");
                influxDBPublish(fields, "wf/obs_st", flattenObj);
            }

            if (config.mongoDBHost) {
                console.info("Sending event to MongoDB");
                mongo.connect(url, function (err, client) {
                    assert.equal(null, err);
                    const db = client.db(dbCollection);
                    insertDocuments(db, msg, "obs_st", function () {
                        client.close();
                    });
                });
            }

        }

        if (msg.type == "rapid_wind") {
            msg.ob = decodeRapidWind(msg.ob);
            console.info("Message: rapid_wind");

            let fields = {
                direction: Influx.FieldType.INTEGER,
                speed: Influx.FieldType.FLOAT,
                timestamp: Influx.FieldType.INTEGER,
            };

            let data = {
                direction: msg.ob.direction,
                speed: msg.ob.mps,
                timestamp: msg.ob.timestamp,
            };

            if (config.influxDBHost) {
                console.info("Sending event to InfluxDB");
                influxDBPublish(fields, "wf/rapid_wind", data);
            }

            if (config.mongoDBHost) {
                console.info("Sending event to MongoDB");
                mongo.connect(url, function (err, client) {
                    assert.equal(null, err);
                    client;
                    const db = client.db(dbCollection);
                    insertDocuments(db, msg, "rapid_wind", function () {
                        client.close();
                    });
                });
            }
        }

        if (msg.type == "hub_status") {
            console.info("Message: hub_status");

            let fields = {
                serial_number: Influx.FieldType.STRING,
                firmware_revision: Influx.FieldType.INTEGER,
                uptime: Influx.FieldType.INTEGER,
                rssi: Influx.FieldType.INTEGER,
                timestamp: Influx.FieldType.INTEGER,
                reset_flags: Influx.FieldType.STRING,
            };

            let data = {
                serial_number: msg.serial_number,
                firmware_revision: msg.firmware_revision,
                uptime: msg.uptime,
                rssi: msg.rssi,
                timestamp: msg.timestamp,
                reset_flags: msg.reset_flags,
            };

            if (config.influxDBHost) {
                console.info("Sending event to InfluxDB");
                influxDBPublish(fields, "wf/status_hub", data);
            }

            if (config.mongoDBHost) {
                console.info("Sending event to MongoDB");
                mongo.connect(url, function (err, client) {
                    assert.equal(null, err);
                    const db = client.db(dbCollection);
                    insertDocuments(db, msg, "hub_status", function () {
                        client.close();
                    });
                });
            }
        }

        if (msg.type == "device_status") {
            console.info("Sending event to InfluxDB");
            console.info("Message: device_status");

            let fields = {
                serial_number: Influx.FieldType.STRING,
                hub_sn: Influx.FieldType.STRING,
                timestamp: Influx.FieldType.INTEGER,
                uptime: Influx.FieldType.INTEGER,
                voltage: Influx.FieldType.FLOAT,
                firmware_revision: Influx.FieldType.INTEGER,
                rssi: Influx.FieldType.INTEGER,
                hub_rssi: Influx.FieldType.INTEGER,
                sensor_status: Influx.FieldType.INTEGER,
                debug: Influx.FieldType.INTEGER,
            };

            let data = {
                serial_number: msg.serial_number,
                hub_sn: msg.hub_sn,
                timestamp: msg.timestamp,
                uptime: msg.uptime,
                voltage: msg.voltage,
                firmware_revision: msg.firmware_revision,
                rssi: msg.rssi,
                hub_rssi: msg.hub_rssi,
                sensor_status: msg.sensor_status,
                debug: msg.debug,
            };

            if (config.influxDBHost) {
                console.info("Sending event to InfluxDB");
                influxDBPublish(fields, "device_status", data);
            }


            if (config.mongoDBHost) {
                console.info("Sending event to MongoDB");
                mongo.connect(url, function (err, client) {
                    assert.equal(null, err);
                    const db = client.db(dbCollection);
                    insertDocuments(db, msg, "device_status", function () {
                        client.close();
                    });
                });
            }
        }

        if (msg.type == "evt_strike") {
            console.info("Message: evt_strike " + JSON.stringify(msg));

            if (config.mongoDBHost) {
                mongo.connect(url, function (err, client) {
                    assert.equal(null, err);
                    const db = client.db(dbCollection);
                    insertDocuments(db, msg, "evt_strike", function () {
                        client.close();
                    });
                });
            }
        }

        if (msg.type == "evt_precip " + JSON.stringify(msg)) {
            console.info("Message: evt_precip " + JSON.stringify(msg));

            if (config.mongoDBHost) {
                mongo.connect(url, function (err, client) {
                    assert.equal(null, err);
                    const db = client.db(dbCollection);
                    insertDocuments(db, msg, "evt_precip", function () {
                        client.close();
                    });
                });
            }
        }
    });

    server.bind(config.UDPPORT, () => {
        console.info("Server is listening on IP " + server.address().address + " on port " + config.UDPPORT, "info");
    });
});