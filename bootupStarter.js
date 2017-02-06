var app = require('express')();
var http = require('http').Server(app);
var config = require(__dirname + '/APIConfig.json');
var Promise = require('es6-promise').Promise;
var processPort = config.bootupStarterPort;
var exec = require('child_process').exec,
    child, bootupTime = config.bootUpRestartTime;

console.log('agreegator app bootupStarter running @ ' + processPort);

app.listen(processPort, function () {
    setTimeout(function () {
        appStarter();
    }, bootupTime);
})

function appStarter() {
    child = exec('sh ' + __dirname + '/appRestart.sh',
        function (error, stdout, stderr) {
            console.log('agreegator app restart after ' + bootupTime + ' sec, stdout: ' + stdout);
            console.log('agreegator app restart after ' + bootupTime + ' sec, stderr: ' + stderr);
            if (error !== null) {
                console.log('agreegator app restart after ' + bootupTime + ' sec, error: ' + error);
            }
        }
    )
}