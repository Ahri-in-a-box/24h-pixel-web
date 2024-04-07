const Repository = require("./repository");
const ServerSocket = require("./server-socket");

const repository = new Repository("workers");

class Worker {
    constructor(workerId) {
        this.queue = [];
        this.id = workerId;

        try {
            this.lastTask = Date.parse(repository.get(this.id).lastUse);
        } catch {
            this.lastTask = undefined;
        }
    }

    startNextTask() {
        const task = this.queue.find(x => !x.ended);
        this.lastTask = new Date();

        const data = repository.get(this.id) ?? { usage: 0 };
        data.date = this.lastTask;
        data.usage++;
        repository.addOrUpdate(this.id, data)
            .saveChanges();
        ServerSocket.sockets.forEach(x => x.onWorkerDown(this));

        task?.execute(this)
            .then(_ => { task.ended = true; this.startNextTask(); })
            .catch(_ => { task.ended = true; this.startNextTask(); });

        if(task == undefined && typeof(this.onEnd) === "function") {
            this.onEnd();
        }
    }

    addTask(task) {
        this.queue.push(task);

        if(this.queue.length == 1 || this.queue[this.queue.length - 1].ended) {
            this.startNextTask();
        }
    }

    get cooldown() {
        if(!this.lastTask) {
            return 0;
        }

        return Math.max(((this.lastTask - new Date()) / 1000) + 11, 0);
    }

    get waiting() {
        this.queue.filter(x => !x.ended).length;
    }

    set onEnd(val) {
        this.endFunction = val;
    }
}

const Workers = [];
for(let i = 0; i < 50; i++) {
    Workers.push(new Worker(i));
}

module.exports = { Worker, Workers };