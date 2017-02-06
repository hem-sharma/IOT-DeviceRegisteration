var app = require('express')();
var http = require('http').Server(app);
var https = require('https');
var config = require(__dirname + '/APIConfig.json');
var Promise = require('es6-promise').Promise;
var processPort = config.sensorServerPort;
var fs = require('fs');
var file = config.reciever;

var SerialPort = require('serialport');

var port = new SerialPort.SerialPort(file, {
  baudrate: config.baudrate,
  parser: SerialPort.parsers.readline('\r\n')
});

var GPS = require(__dirname + '/gps.js');

var gps = new GPS;

gps.on('GGA', function (data) {
  var contents = fs.readFileSync(__dirname + config.AgreegatorIdFilePath);
  config = JSON.parse(contents);
  if (!config.AgreegatorId && config.AgreegatorType.toUpperCase() !== 'D3498E79-8B6B-40F1-B96D-93AA132B2C5B')
    console.log('Agreegator Id, type found', config.AgreegatorId, config.AgreegatorType);
  else {
    console.log('data recieved', data.lat, data.lon, new Date().toString());
    if (config.AgreegatorId !== null && data && data.lat && data.lon) {
      var contents = fs.readFileSync(__dirname + config.AgreegatorIdFilePath);
      config = JSON.parse(contents);
      performRequest(config.APIforSendGpsDataEndpoint, 'POST', {
        AgreegatorId: config.AgreegatorId,
        latitude: data.lat,
        longitude: data.lon,
        SentDate: new Date().toISOString()
      }, function (res) {
        console.log(res);
      });
    }
  }
});

function performRequest(endpoint, method, data, success) {
  var contents = fs.readFileSync(__dirname + config.AgreegatorIdFilePath);
  config = JSON.parse(contents);
  var querystring = require('querystring');
  var sender = config.HttpsAPIRequest ? https : require('http');
  var headers = {};
  var dataString = JSON.stringify(data);
  endpoint += '?' + querystring.stringify(data);
  var options = {
    hostname: config.ApiHostName,
    path: endpoint,
    port: config.ApiHostPort,
    method: method,
    agent: false
  };
  var req = sender.request(options, function (res) {
    res.on('data', function (d) {
      var resString = '' + d;
      success(resString);
    });
  });

  req.on('error', function (e) {
    var customMessage = {
      status: 500,
      error: 'Some error for checking request'
    };
    success(JSON.parse(customMessage));
  });
  req.end();
}

http.listen(processPort, function () {
  console.log('listening on *:' + processPort);
});

port.on('data', function (data) {
  gps.update(data);
});