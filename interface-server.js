/*
 *  An express application to accept a path from an iPad
 *  and connect to the OpenCV control system for ChairBot.
 *
 */

// Require the modules needed
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    exec = require('child_process').exec,
    WebSocket = require('ws'),
    spawn = require('child_process').spawn;

// Child Process
var cv = null;

// Connect to neato websocket
//const ws = new WebSocket("ws://neato-04.local:3000");

// Express app setup
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));

// Define /path route
app.post('/path', function(req, res) {

  // Prepare write stream for the YAML path file to be written
  var stream = fs.createWriteStream("../path_0.yml");
  stream.write("%YAML:1.0\n");
  stream.write("features:\n");

  // Write the path array to the file
  req.body.path.forEach(function(element) {
    stream.write("   - { x:");
    stream.write(String(element[0]));
    stream.write(", y:");
    stream.write(String(element[1]));
    stream.write(" }\n");
  });

  console.log("Path received and printed. ");


  // Execute the OpenCV control system

  const defaults = {
    encoding: 'utf8',
    timeout: 0,
    maxBuffer: 1024 * 1024,
    killSignal: 'SIGTERM',
    cwd: null,
    env: null
  }

  cv = spawn("../CV1", defaults, function(err, stdout, stderr) {
    if (err) {
        console.log('Child process exited with error code', err.code);
        return;
    }

    console.log(stdout);
  });

  res.send({ status: 'SUCCESS' });
});

app.post('/stop', function(req, res) {

    console.log('Neato stop request received. ');

    if(cv !== null) {
        cv.kill('SIGTERM');
        res.send('success');
    } else {
      res.send('failed');
      console.log('could not kill CV app');
    }
});

// Start server
app.listen(app.get('port'), function() {
  console.log('Server running on port ', app.get('port'));
});
