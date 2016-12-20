var app = require('express')();
var http = require('http').Server(app);

var config = require(__dirname + '/APIConfig.json');

var processPort = config.port;

var file = config.reciever;


var SerialPort = require('serialport');

//baud rate can be changeable from config file
var port = new SerialPort.SerialPort(file, {
  baudrate: config.baudrate,
  parser: SerialPort.parsers.readline('\r\n')
});

//custom module for getting gps data
var GPS = require(__dirname + '/gps.js');

var gps = new GPS;


gps.on('GGA', function (data) {
  console.log('data recieved', data);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/AssignAgreegator', function (req, res) {
  //TODO: update agreegator Id consumed by sending GPS data
});

app.get('/AddWifiCredentials', function (req, res) {
  //TODO: update wifi and password value usign updateConfigWithAgreegatorId and then change the device wifi file
});

function updateConfigWithAgreegatorId(obj, val) {

}

function appendWiFiConfigCreds(ssid, password) {

}

http.listen(processPort, function () {
  console.log('listening on *:' + processPort);
});

port.on('data', function (data) {
  gps.update(data);
});