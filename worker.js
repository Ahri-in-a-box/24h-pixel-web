class Worker {
    constructor(workerId) {
        this.queue = [];
        this.id = workerId;
    }

    startNextTask() {
        const task = this.queue.find(x => !x.ended);

        task?.execute()
            .then(_ => { task.ended = true; this.startNextTask(); })
            .catch(_ => { task.ended = true; this.startNextTask(); });
    }

    addTask(task) {
        this.queue.push(task);

        if(this.queue.length == 1 || this.queue[this.queue.length - 1].ended) {
            this.startNextTask();
        }
    }
}

const Workers = [];
for(let i = 0; i < 50; i++) {
    Workers.push(new Worker(i));
}

module.exports = { Worker, Workers };