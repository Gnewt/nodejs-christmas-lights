var async = require('async');

var LIGHT_COUNT = 36;

var SerialPort = require("serialport").SerialPort;
var serialPort = null;

var colors = {
	'white': [0xF, 0xF, 0xF], 
    'black': [0x0, 0x0, 0x0],
    'red': [0xF, 0x0, 0x0],
    'green': [0x0, 0xF, 0x0],
    'blue': [0x0, 0x0, 0xF],
	'cyan': [0x0, 0xF, 0xF],
	'magenta': [0xF, 0x0, 0xF],
	'yellow': [0xF, 0xF, 0x0],
	'purple': [0xA, 0x3, 0xD],
	'orange': [0xF, 0x1, 0x0],
	'warm white': [0xF, 0x7, 0x2],
};

function connect(port, baudrate, callback) {
	serialPort = new SerialPort(port, {
		baudrate: baudrate,
	});

	serialPort.on('open', function() {
		callback();
		console.log("Connected to serial port");
	});
}
exports.connect = connect;

// The following can be used for testing without
// the Arduino present.
serialPort = {
	write: function(data, callback) { callback(); },
};

function fakeConnect(port, baudrate, callback) {
	callback();
	console.log("Connected to serial port");
}
//exports.connect = fakeConnect;

function rawColor(red, green, blue, callback) {
	var packedData = new Buffer(2);
	packedData.fill(0x0);

	packedData[0] = red;
	packedData[1] = green << 4;
	packedData[1] += blue;

	serialPort.write(packedData, callback);
}
exports.rawColor = rawColor;

function setColor(color, callback) {
	if (color in colors) {
		var colorData = colors[color];
		rawColor(colorData[0], colorData[1], colorData[2], callback);
		callback();
	}
	else {
		callback("No such color in my list (" + color + ")");
	}
}
exports.setColor = setColor;

function fillColor(color, callback) {
	async.series([
		function (callback) {
			pause(callback);
		},
		function (callback) {
			for (i = 0; i < LIGHT_COUNT; i ++) {
				setColor(color, callback);
			}
		},
		function (callback) {
			resume(callback);
		}
	],
	callback);
}
exports.fillColor = fillColor;

function pause(callback) {
	var packedData = new Buffer(2);
	packedData.fill(0x0);

	packedData[0] = 0xF << 4;

	serialPort.write(packedData, callback);
}

function resume(callback) {
	var packedData = new Buffer(2);
	packedData.fill(0x0);

	packedData[0] = 0xE << 4;

	serialPort.write(packedData, callback);
}

// Generic callback
function logIfError(err, data) {
	if (err) {
		console.log("Error: ");
	}
}
