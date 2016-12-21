var app = require('express')();
var http = require('http').Server(app);
var https = require('https');
var config = require(__dirname + '/APIConfig.json');
var jsonFile = require('jsonfile');
var bodyParser = require('body-parser');
var processPort = config.port;

var file = config.reciever;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//TODO:uncomment
//var SerialPort = require('serialport');

// var port = new SerialPort.SerialPort(file, {
//   baudrate: config.baudrate,
//   parser: SerialPort.parsers.readline('\r\n')
// });

var GPS = require(__dirname + '/gps.js');

var gps = new GPS;

gps.on('GGA', function (data) {
  console.log('data recieved', data);
  if (config.AgreegatorId !== null)
    performRequest(APIforSendDataEndpoint, 'POST', {
      AgreegatorId: config.AgreegatorId
    })
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
  console.log('agreegator id after reg: ', agreegatorId);
  var result = updateConfigWithAgreegatorId('AgreegatorId', agreegatorId, __dirname + config.AgreegatorIdFilePath);
  res.send(result);
});

app.post('/AddWifiCredentials', function (req, res) {
  var ssid = req.body.ssid;
  var password = req.body.password;
  console.log('ssid', ssid);
  console.log('password', password);
  //config.WifiConfigPath;
  var result = appendWiFiConfigCreds(ssid, password, __dirname + '/APIConfig.json');
  res.send(result);
});

function performRequest(endpoint, method, data, success) {
  var headers = {};
  var dataString = JSON.stringify(data);
  if (method == 'GET') {
    endpoint += '?' + querystring.stringify(data);
  } else {
    headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    };
  }
  var options = {
    hostname: config.HostName,
    path: endpoint,
    port: 443,
    method: method,
    agent: false
  };
  var req = https.request(options, function (res) {
    res.setEncoding('utf-8');
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
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

function updateConfigWithAgreegatorId(obj, val, filePath) {
  try {
    jsonFile.readFile(filePath, function (err, obj) {
      var updateData = {
        obj: val
      };
      jsonFile.writeFile(filePath, updateData, function (err) {
        return {
          status: false,
          message: err
        };
      });
    });
    return {
      status: true,
      message: "Updated successfully!"
    };

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
    jsonFile.readFile(filePath, function (err, obj) {
      var appendData = 'network={ssid=' + ssid + ' psk=' + password + '}';
      jsonFile.writeFile(filePath, appendData, function (err) {
        return {
          status: false,
          message: err
        };
      });
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

// port.on('data', function (data) {
//   gps.update(data);
// });