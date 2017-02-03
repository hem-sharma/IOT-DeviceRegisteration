var app = require('express')();
var http = require('http').Server(app);
var https = require('https');
var config = require(__dirname + '/APIConfig.json');
var Promise = require('es6-promise').Promise;
var processPort = config.gpsStarterPort;
var fs = require('fs');
var exec = require('child_process').exec,
    child;

http.listen(processPort, function () {
    console.log('listening on *:' + processPort);
});

var alreadyStarted = false,
    alreadyStopped = true;

//checker for aggregator id and type are not null and if found vehicle type then start gps tracker
while (true) {
    var contents = fs.readFileSync(__dirname + config.AgreegatorIdFilePath);
    config = JSON.parse(contents);

    console.log('checking if config changed for vehicle aggregator');

    if (!isNUllOrEmpty(config.AgreegatorId) && !isNUllOrEmpty(config.AgreegatorType)) {
        if (config.AgreegatorType.toUpperCase() == 'D3498E79-8B6B-40F1-B96D-93AA132B2C5B') {
            console.log('Config found for vehicle type, therefore starting gpsServer')
            if (!alreadyStarted) {
                startCmd();
            }
        } else {
            console.log('Config not found vehicle type');
            if (!alreadyStopped) {
                stopCmd();
            }
        }
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
    console.log('starting gps server + updating bootup', new Date());
    child = exec('sh ' + __dirname + '/gpsServerStart.sh',
        function (error, stdout, stderr) {
            console.log('agreegator app restart after 10 sec, stdout: ' + stdout);
            console.log('agreegator app restart after 10 sec, stderr: ' + stderr);
            alreadyStopped = false;
            if (error !== null) {
                console.log('agreegator app restart after 10 sec, error: ' + error);
            }
        }
    )
};

function stopCmd() {
    console.log('stopping gps server + updating bootup', new Date())
    child = exec('sh ' + __dirname + '/gpsServerStop.sh',
        function (error, stdout, stderr) {
            console.log('agreegator app restart after 10 sec, stdout: ' + stdout);
            console.log('agreegator app restart after 10 sec, stderr: ' + stderr);
            alreadyStopped = true;
            if (error !== null) {
                console.log('agreegator app restart after 10 sec, error: ' + error);
            }
        }
    )
};