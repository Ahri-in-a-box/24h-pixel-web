const { Server } = require("socket.io");

class ServerSocket {
    static sockets = [];

    constructor(server) {
        this.socket = new Server(server);
        ServerSocket.sockets.push(this);
    }

    onWorkerDown(worker) {
        this.socket.emit("workers/updated", { workerId: worker.id });
    }
}

module.exports = ServerSocket;