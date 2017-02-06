var app = require('express')();
var http = require('http').Server(app);
var config = require(__dirname + '/APIConfig.json');
var Promise = require('es6-promise').Promise;
var processPort = config.bootupStarterPort;
var exec = require('child_process').exec,
    child;

console.log('agreegator bootupStarter running on *:' + processPort);

setTimeout(function () {
    console.log('restarting agreegator app now to assure gps properly connected after bootup');
    restartProcessForGps();
}, 10000);

//restart agreegator api once after bootup assuring gps device connected perfectly
function restartProcessForGps() {
    child = exec('sh ' + __dirname + '/appRestart.sh',
        function (error, stdout, stderr) {
            console.log('agreegator app restart after 10 sec, stdout: ' + stdout);
            console.log('agreegator app restart after 10 sec, stderr: ' + stderr);
            if (error !== null) {
                console.log('agreegator app restart after 10 sec, error: ' + error);
            }
        }
    )
};