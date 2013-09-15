var http = require('http');
var url = require('url');
var querystring = require('querystring');

var serialDispatch = require('./serialDispatch');

// Set up our TTY
var stdin = process.openStdin();

// Variables for our serial connection
PORT = "/dev/ttyACM0";
BAUDRATE = 9600;

function onRequest(request, response) {
	if (request.method == "POST") {
		var data = "";

		request.on('data', function(chunk) {
			data += chunk;
		});

                request.on('end', function() { handleData(request, response, data); });
	}
}

function handleData(request, response, data) {
    var requestUrl = url.parse(request.url);
    console.log("Data: " + data);
    var jsonData = JSON.parse(querystring.parse(data).jsonData);

    if ('color' in jsonData) {
            serialDispatch.setColor(jsonData['color'], function(err) {
                    if (err) {
                            console.log(err);
                            failResponse(response);
                    }
                    else {
                            successResponse(response);
                    }
            });
            console.log(jsonData);
    }
    else {
            failResponse(response);
    }
}

function successResponse(response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Success\n");
    response.end();
}

function failResponse(response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("No such color found\n");
    response.end();
}


serialDispatch.connect(PORT, BAUDRATE, function (err) { if (err) console.log(err); });
http.createServer(onRequest).listen(8080);
