# weatherflow-udp-server

Grabs UDP datagrams from network and writes the data to configured databases.

# Configuration File

Requires host volume storage for configuration file. Map volume to /usr/app/config, example would be ./config:/usr/app/config. Create volume directory on host before creating the container and populate the configuration file.

Exmaple:
{
"UDPPORT": 50222,
"mongoDBName": "",
"mongoDBHost": "",
"mongoDBPort": 27017,
"mongoDBCollection": "",
"mongoDBUserName": "",
"mongoDBPassword": "",
"influxDBHost": "influxdb",
"influxDBName": "weatherflow",
"influxDBPort": 8086,
"influxDBUserName": "",
"influxDBPassword": ""
}

UDPPORT = port that the server listens on, this wouldn't change
mongoDBName = mongodb database name
mongoDBHost = host that mongodb is hosted on
mongoDBPort = port that mongodb runs on
mongoDBCollection = collection name for mongodb
mongoDBUserName = currently not used, database needs to be open
mongoDBPassword = currently not used, database needs to be open
influxDBHost = influxdb host
influxDBName = influxdb database name
influxDBPort = port influxdb runs on
influxDBUserName = currently not used, database needs to be open
influxDBPassword = currently not used, database needs to be open

The configuration file is read when the container is ran. If the configuration file changes, the changes will take affect soon after the file is saved. The UDPPORT configuration will not be affected by changed to the configuration file, all other configuration will take affect.
