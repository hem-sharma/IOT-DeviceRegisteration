var app = require('express')();
var http = require('http').Server(app);
var https = require('https');
var config = require(__dirname + '/APIConfig.json');
//var jsonFile = require('jsonfile');
var bodyParser = require('body-parser');
var fs = require('fs');
var processPort = config.port;

var file = config.reciever;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//TODO:uncomment
var SerialPort = require('serialport');

var port = new SerialPort.SerialPort(file, {
  baudrate: config.baudrate,
  parser: SerialPort.parsers.readline('\r\n')
});

var GPS = require(__dirname + '/gps.js');

var gps = new GPS;

gps.on('GGA', function (data) {
  if (config.AgreegatorId !== null && config.AgreegatorType === 'D3498E79-8B6B-40F1-B96D-93AA132B2C5B')
    return;
  console.log('data recieved', data);
  if (config.AgreegatorId !== null)
    performRequest(config.APIforSendDataEndpoint, 'POST', {
      AgreegatorId: config.AgreegatorId,
      latitude: data.lat,
      longitude: data.long,
      SentDate: new Date()
    }, function (res) {
      console.log(res);
    });
});

app.get('/', function (req, res) {
  if (config.AgreegatorId !== null)
    res.sendFile(__dirname + '/wifisetup.html');
  res.sendFile(__dirname + '/index.html');
});

app.get('/wifisetup', function (req, res) {
  res.sendFile(__dirname + '/wifisetup.html');
});

app.get('/AssignAgreegator', function (req, res) {
  if (config.AgreegatorId !== null)
    res.sendFile(__dirname + '/wifisetup.html')
  var agreegatorId = req.body.agreegatorId;
  var agreegatorType = req.body.agreegatortype;
  console.log('agreegator id after reg: ', agreegatorId);
  var result = updateConfigWithAgreegatorId(agreegatorId, agreegatorType, __dirname + config.AgreegatorIdFilePath);
  res.send(result);
});

app.post('/AddWifiCredentials', function (req, res) {
  var ssid = req.body.ssid;
  var password = req.body.password;
  console.log('ssid', ssid);
  console.log('password', password);
  var result = appendWiFiConfigCreds(ssid, password, config.WifiConfigPath);
  res.send(result);
});

function performRequest(endpoint, method, data, success) {
  var querystring = require('querystring');
  var sender = config.HttpsAPIRequest ? https : require('http');
  var headers = {};
  var dataString = JSON.stringify(data);
  endpoint += '?' + querystring.stringify(data);
  var options = {
    hostname: config.HostName,
    path: endpoint,
    port: config.HostPort,
    method: method,
    agent: false
  };
  var req = sender.request(options, function (res) {
    res.setEncoding('utf8');
    req.write(data);
    res.on('data', function (d) {
      var resString = '' + d;
      success(JSON.parse(resString));
    });
  });
  req.end();
  req.on('error', function (e) {
    var customMessage = {
      status: 500,
      error: 'Some error for checking request'
    };
    success(JSON.parse(customMessage));
  });
}

function updateConfigWithAgreegatorId(agreegatorId, agreegatorType, filePath) {
  try {
    var json = require('json-update');
    json.update(filePath, {
      AgreegatorId: agreegatorId,
      Agreegatortype: agreegatorType
    }, function (err, obj) {
      if (typeof err !== "undefined" && err !== null) {
        return {
          status: false,
          message: err
        };
      }
      return {
        status: true,
        message: 'Agreegator Id updated successfully.'
      };
    });
  } catch (e) {
    console.log('error occured in agreegator id update: ', e);
    return {
      status: false,
      message: e
    };
  }
}

function appendWiFiConfigCreds(ssid, password, filePath) {
  try {
    var appendData = '\nnetwork={\nssid="' + ssid + '"\npsk="' + password + '"\n}';
    fs.appendFile(filePath, appendData, function (err) {
      if (err) return {
        status: false,
        message: err
      };
      else return {
        status: false,
        message: e
      };
    });
    return {
      status: true,
      message: "Updated successfully!"
    };
  } catch (e) {
    console.log('error occured in wifi update: ', e);
    return {
      status: false,
      message: e
    };
  }
}

http.listen(processPort, function () {
  console.log('listening on *:' + processPort);
});
//TODO:uncomment
port.on('data', function (data) {
  gps.update(data);
});