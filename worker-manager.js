const { Workers } = require("./worker");

function relocateWorkers(from, to, number) {
    if(from.length == number) {
        from.forEach(x => to.push(x));
        return;
    }

    for(let i = 0; i < number; i++) {
        const val = Math.floor(Math.random() * to.length);
        to.push(from[val]);
        from.splice(val, 1);
    }
}

function releaseCluster(cluster, defaultCluster) {
    if(cluster.every(w => w.queue.every(t => t.ended))) {
        cluster.forEach(x => x.queue = []);
        relocateWorkers(cluster, defaultCluster, cluster.length);
    }
}

class WorkerManager {
    constructor() {
        this.workers = Workers;
        this.dedicated = 0;
        this.clusters = {
            default: [...this.workers]
        };
    }

    createCluster(clusterName, numberOfWorkers) {
        if(this.dedicated + numberOfWorkers > 50) {
            throw new Error("Cannot allocate ${this.dedicated} workers only ${50 - this.dedicated} available.");
        }

        if(numberOfWorkers <= 0) {
            throw new Error("Cannot allocate 0 or less workers.");
        }

        this.clusters[clusterName] = [];
        relocateWorkers(this.clusters.default, this.clusters[clusterName], numberOfWorkers);
    }

    releaseCluster(clusterName) {
        if(this.clusters[clusterName]) {
            this.clusters.default = [...this.clusters.default, ...this.clusters[clusterName]];
        }
    }

    releaseClusterOnFinish(clusterName) {
        if(clusterName == "default")
            return;

        this.clusters[clusterName]
            .forEach(worker => worker.onEnd = _ => releaseCluster(this.clusters[clusterName], this.clusters.default));
    }

    getCluster(clusterName = "default") {
        return this.clusters[clusterName];
    }

    getMostConvenientWorker(clusterName) {
        return this.clusters[clusterName]
            .shuffle()
            .sort((a, b) => a.queue.length == b.queue.length ? a.cooldown - b.cooldown : a.queue.length - b.queue.length)[0];
    }

    addTask(task, clusterName = "default") {
        this.getMostConvenientWorker(clusterName)
            .addTask(task);
    }
}

module.exports = new WorkerManager();