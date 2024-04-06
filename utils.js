const { existsSync } = require('fs');

const PUBLIC = __dirname + '/public';

function mintype(path) {
    switch (path.split('.')[1]) {
        case "txt":
            return "text/plain";
        case "html":
            return "text/html";
        case "css":
            return "text/css";
        case "png":
            return "img/png";
        case "jpg":
            return "img/jpg";
        default:
            return "application/octet-stream";
    }
}

function send(res, path) {
    if(existsSync(`${PUBLIC}/${path}`))
        res.sendFile(`${PUBLIC}/${path}`);
    else
        res.sendStatus(404);
}

module.exports = {
    PUBLIC,
    mintype,
    send 
}