const { io } = require("socket.io-client");

class WebSocket {
    constructor() {
        this.callbacks = {};
    }

    open(token, onclose) {
        this.socket?.close();
        this.socket = io('http://149.202.79.34:8085/api/socket', {
            auth: { token }
        });

        this.socket.on("close", onclose);
    }

    close() {
        this.socket.close();
    }

    addListener(id, callback) {
        this.callbacks[id] = callback;
        this.socket.on("pixelUpdated", event => Object.values(this.callbacks).forEach(x => x(event)));
    }

    removeListener(id) {
        delete this.callbacks[id];
    }
}

module.exports = new WebSocket();