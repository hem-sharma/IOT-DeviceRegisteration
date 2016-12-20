var app = require('express')();
var http = require('http').Server(app);

//Getting config for Api
var config = require('../APIConfig.json');

//getting port for server process
var processPort = config.port;

//Reciever process file location
var file = config.reciever;

//port for getting data
var SerialPort = require('serialport');

//baud rate can be changeable from config file
var port = new SerialPort.SerialPort(file, {
  baudrate: config.baudrate,
  parser: SerialPort.parsers.readline('\r\n')
});

//GPS for getting data
var GPS = require('../gps.js');
var gps = new GPS;


gps.on('GGA', function (data) {
  //TODO: calling API to store the data in VA db
  console.log('data recieved', data);
  //io.emit('position', data);
});

// app.get('/', function(req, res) {
//   res.sendFile(__dirname + '/maps.html');
// });

http.listen(processPort, function () {
  console.log('listening on *:3000');
});

port.on('data', function (data) {
  gps.update(data);
});