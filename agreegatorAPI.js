var app = require('express')();
var http = require('http').Server(app);
var https = require('https');
var config = require(__dirname + '/APIConfig.json');
var bodyParser = require('body-parser');
var Promise = require('es6-promise').Promise;
var fs = require('fs');
var processPort = config.port;
var file = config.reciever;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// TODO:comment if local
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
    //console.log(data);
    console.log('data recieved', data.lat, data.lon, new Date().toString());
    if (config.AgreegatorId !== null && data && data.lat && data.lon) {
      var contents = fs.readFileSync(__dirname + config.AgreegatorIdFilePath);
      config = JSON.parse(contents);
      performRequest(config.APIforSendDataEndpoint, 'POST', {
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

app.get('/', function (req, res) {
  var contents = fs.readFileSync(__dirname + config.AgreegatorIdFilePath);
  config = JSON.parse(contents);
  if (config.AgreegatorId && config.AgreegatorType.toUpperCase() === 'D3498E79-8B6B-40F1-B96D-93AA132B2C5B')
    res.sendFile(__dirname + '/wifisetup.html');
  else if (!config.AgreegatorId)
    res.sendFile(__dirname + '/index.html');
  else res.send("Already registered.");
});

app.get('/dynaptwifisetup', function (req, res) {
  res.sendFile(__dirname + '/wifisetup.html');
});

app.post('/AssignAgreegator', function (req, res) {
  var agreegatorId = req.body.AgreegatorId;
  var agreegatorType = req.body.AgreegatorType;
  console.log('agreegator id after reg: ', agreegatorId);
  updateConfigWithAgreegatorId(agreegatorId, agreegatorType, __dirname + config.AgreegatorIdFilePath, function (response) {
    res.send(response);
  });

});

app.post('/AddWifiCredentials', function (req, res) {
  var contents = fs.readFileSync(__dirname + config.AgreegatorIdFilePath);
  config = JSON.parse(contents);
  var ssid = req.body.ssid;
  var password = req.body.password;
  console.log('ssid', ssid);
  console.log('password', password);
  var result = appendWiFiConfigCreds(ssid, password, config.WifiConfigPath);
  res.send(result);
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
    hostname: config.HostName,
    path: endpoint,
    port: config.HostPort,
    method: method,
    agent: false
  };
  //console.log('options for sending request', options);
  var req = sender.request(options, function (res) {
    // res.setEncoding('utf8');
    // req.write(data);
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

function updateConfigWithAgreegatorId(agreegatorId, agreegatorType, filePath, callback) {
  try {
    console.log('filePath: ', filePath)
    var json = require('json-update');
    json.update(filePath, {
      AgreegatorId: agreegatorId,
      AgreegatorType: agreegatorType
    }, function (err, obj) {
      if (typeof err !== "undefined" && err !== null) {
        callback({
          status: false,
          message: err
        });
      }
      var contents = fs.readFileSync(__dirname + config.AgreegatorIdFilePath);
      config = JSON.parse(contents);
      callback({
        status: true,
        message: 'Agreegator Id updated successfully.'
      });
    });
  } catch (e) {
    console.log('error occured in agreegator id update: ', e);
    callback({
      status: false,
      message: e
    });
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
        status: true,
        message: "updated successfully."
      };
    });
    var contents = fs.readFileSync(__dirname + config.AgreegatorIdFilePath);
    config = JSON.parse(contents);
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
//TODO:comment if local
port.on('data', function (data) {
  gps.update(data);
});
