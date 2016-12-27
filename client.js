#!/usr/bin/env node
var net = require('net');
var socks = require('node-socks/socks.js');
var http = require('http');
var b64 = require('./lib/base64stream');
var tunnel = require('./lib/request_tunnel.js')

var tunnel_address, tunnel_port;

if (!process.argv[2]) {
  console.log('Usage: ./client TUNNEL_ADDRESS [MODE] # TUNNEL ADDRESS is the address of the tunnelling server. pass development as MODE for port 3001 ');
  return 0;
} else {
  tunnel_address = process.argv[2]
}

if (process.argv[3] == 'development') {
  tunnel_port = 3001;
} else {
  tunnel_port = 80;
}

// Create SOCKS server
// The server accepts SOCKS connections. This particular server acts as a proxy.
var HOST='0.0.0.0',
    PORT='1080'

var client = tunnel.createPersistentClient(tunnel_address, tunnel_port, function() {
  console.log('Client created');
});

var socks_server = socks.createServer(function(socket, port, address, proxy_ready) {
  try {

    // Received a connection.
    console.log('Received a connection');

    // Make a connection through the tunnel
    var conn = client.TCPConnection({host: address, port: port}, function (conn) {
      // Now pipe the data
      socket.pipe(conn).pipe(socket);

      proxy_ready(); // TODO - delay until the proxy is actually ready
    });
  } catch(err) {
    console.log(err);
  }
});


socks_server.listen(PORT, HOST);

// vim: set filetype=javascript syntax=javascript :

