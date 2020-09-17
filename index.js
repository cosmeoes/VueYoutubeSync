var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
});

server.listen(1337, function() { });

wsServer = new WebSocketServer({
  httpServer: server
});


let clients = [];
let partyOwner = null;

function sendMessage(user, message) {
    let json = JSON.stringify({type: 'message', message: user + ": " + message});
    if (partyOwner) {
        partyOwner.sendUTF(json);
    }
    for (var i=0; i < clients.length; i++) {
        clients[i].sendUTF(json);
    }
}
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);


    if (partyOwner == null) {
        sendMessage('info:', "owner connected");
        connection.sendUTF(JSON.stringify({type: "role_msg", role: "owner"}))
        partyOwner = connection;
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                let data = JSON.parse(message.utf8Data);
                if (data.type == "update") {
                    for (var i = 0; i < clients.length; i++) {
                        clients[i].sendUTF(message.utf8Data)
                    }
                }

                if (data.type == "message") {
                    sendMessage('owner', data.message);
                }
            }
        });

        connection.on('close', function(connection) {
            sendMessage('info:', "owner disconected");
            partyOwner = null
        });
    } else {
        var index = clients.push(connection) - 1;
        sendMessage('info:', "guest_" + (index + 1) + " connected");
        connection.sendUTF(JSON.stringify({type: "role_msg", role: "guest"}))

        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                let data = JSON.parse(message.utf8Data);
                if (data.type == "message") {
                    sendMessage('guest_'+(index +1) , data.message);
                }
            }
        });

        connection.on('close', function(connection) {
            sendMessage('system', "guest_" + index + " disconected");
        });
    }

});

