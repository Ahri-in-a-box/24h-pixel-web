const http = require('http');
const https = require('https');

const id = process.env.ID;
const apiKey = process.env.KEY;

const express = require('express');
const compression = require('compression');
const serve_static = require('serve-static');

const { readFileSync } = require('fs');
const { send } = require('./utils.js');
const config = require('./config.json');
config.tls = { key: process.env.TLS_KEY, cert: process.env.TLS_CERT };

if(config.useTls){
    if(!(config.tls.key && config.tls.cert))
        throw "TLS enabled but its config is not defined.";

    var options = {
        key: readFileSync(config.tls.key),
        cert: readFileSync(config.tls.cert),
    };
}

const app =  express();
app.use(compression());
app.use(serve_static(__dirname + '/public'));

app.get(['/'], (req, res) => send(res, "./index.html"));

app.use((req, res, next) => {
    req.path.replace("..","");
    if(req.path != "/favicon.ico")
        send(res, req.path);
});

const httpServer = http.createServer(app);
const httpsServer = config.useTls ? https.createServer(options, app) : undefined;

httpServer.listen(config.defaultPort);
httpsServer?.listen(config.defaultHttpsPort);