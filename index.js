const https = require('https');
const tls = require('tls');
const { Agent } = require('https');
const url = require('url');
const http = require('http');

class CustomAgent extends Agent {
  createConnection(options, callback) {
    options = {
      ...options,
      rejectUnauthorized: false, // Ignore SSL certificate errors
    };

    const socket = tls.connect(options, callback);
    return socket;
  }
}

https.Agent = CustomAgent;

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const targetURL = parsedUrl.query.URL;

  if (!targetURL) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request: URL parameter missing');
    return;
  }

  https.get(targetURL, (response) => {
    response.on('data', (data) => {
      res.write(data);
    });
    response.on('end', () => {
      res.end();
    });
  }).on('error', (err) => {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });
}).listen(process.env.PORT || 3000);
