const http = require('http');
const https = require('https');
const ServerSocket = require('./server-socket.js');
require("./array-extensions");

const api = require("./api");
const layersController = require('./layers-controller.js');

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

const app = express();
app.use(express.json());
app.use(compression());
app.use(serve_static(__dirname + '/public'));

app.get(['/'], (req, res) => send(res, "./index.html"));
app.get(['/api/ping'], (req, res) => res.status(200).send("pong"));

app.post(['/api/teams'], api.getTeams.bind(api));
app.post(['/api/canvas'], api.getCanvas.bind(api));
app.post(['/api/canvas/settings'], api.getCanvasSettings.bind(api));
app.post(['/api/canvas/image'], api.getCanvasImage.bind(api));
app.post(['/api/chunk'], api.getChunk.bind(api));
app.post(['/api/worker'], api.getWorker.bind(api));
app.post(['/api/place'], api.placePixel.bind(api));

app.post(['/api/war/start'], api.wageWar.bind(api));
app.post(['/api/war/end'], api.endWar.bind(api));
app.post(['/api/defend/start'], api.defend.bind(api));
app.post(['/api/defend/end'], api.whiteFlag.bind(api));

app.get(['/api/token'], (_, res) => res.status(200).send(api.token));
app.post(['/api/war'], api.getWar.bind(api));
app.get(['/api/workers'], api.getWorkerStatus.bind(api));
app.post(['/war/go'], (req, res) => {
    const data = JSON.parse(readFileSync(`./${req.body.Image}.json`, "utf-8"));
    api.placePixels(data, req.body.Chunk, req.body.Canvas, req.body.Cluster, req.body.Workers ?? 1);
    res.status(200)
        .send("YOLO!");
});

//#region Layers

app.post(['/layers/save'], async (req, res) => {
    await layersController.saveLayer(req.body.Layer ?? req.body);
    const layer = layersController.getLayer(req.body.Layer?.Name ?? req.body.Name);
    res.status(200)
        .send(layer);
});
app.post(['/layers/get'], (req, res) => {
    const layer = layersController.getLayer(req.body.Id ?? req.body.LayerId);
    res.status(200)
        .send(layer);
});
app.post(['/layers'], (_, res) => {
    const layers = layersController.getLayers();
    res.status(200)
        .send(layers);
});

//#endregion Layers

app.use((req, res, next) => {
    req.path.replace("..","");
    if(req.path != "/favicon.ico")
        send(res, req.path);
});

const httpServer = http.createServer(app);
const httpsServer = config.useTls ? https.createServer(options, app) : undefined;
new ServerSocket(httpServer);
if(httpsServer)
    new ServerSocket(httpsServer);

httpServer.listen(config.defaultPort);
httpsServer?.listen(config.defaultHttpsPort);