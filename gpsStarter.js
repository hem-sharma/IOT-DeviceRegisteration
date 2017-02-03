var app = require('express')();
var http = require('http').Server(app);
var https = require('https');
var config = require(__dirname + '/APIConfig.json');
var Promise = require('es6-promise').Promise;
var processPort = config.gpsStarterPort;
var fs = require('fs');
var exec = require('child_process').exec,
    child, SYNC = require('sync'),
    execSync = require('sync-exec');

var alreadyStarted = false,
    alreadyStopped = true;

console.log('checking if config changed for vehicle aggregator started', new Date());

//checker for aggregator id and type are not null and if found vehicle type then start gps tracker
while (true) {
    try {
        var contents = fs.readFileSync(__dirname + config.AgreegatorIdFilePath);
        config = JSON.parse(contents);

        if (!isNUllOrEmpty(config.AgreegatorId) && !isNUllOrEmpty(config.AgreegatorType)) {
            if (config.AgreegatorType.toUpperCase() == 'D3498E79-8B6B-40F1-B96D-93AA132B2C5B') {

                if (!alreadyStarted) {
                    console.log('Config found for vehicle type, therefore starting gpsServer')
                    startCmd();
                }
            } else {
                console.log('Config not found vehicle type, therefore stopping gpsServer');
                if (!alreadyStopped) {
                    stopCmd();
                }
            }
        }
    } catch (e) {
        console.log('Read config error: ', error);
    }
};

function isNUllOrEmpty(value) {
    var isNullOrEmpty = true;
    if (value) {
        if (typeof (value) == 'string') {
            if (value.length > 0)
                isNullOrEmpty = false;
        }
    }
    return isNullOrEmpty;
};

function startCmd() {
    var cmd = 'pm2 start gpsStarter.js';
    alreadyStarted = true;
    alreadyStopped = false;
    SYNC(function () {
        console.log('starting gpsServer: ', execSync(cmd), new Date());
    })
    updateStartup();
};

function stopCmd() {
    var cmd = 'pm2 stop gpsServer.js';
    alreadyStarted = false;
    alreadyStopped = true;
    SYNC(function () {
        console.log('stopping gpsServer: ', execSync(cmd), new Date())
    })
    updateStartup();
};

function updateStartup() {
    var cmd = 'pm2 update';
    SYNC(function () {
        console.log('updating bootup: ', execSync(cmd), new Date())
    })
}