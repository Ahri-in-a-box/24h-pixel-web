const { writeFileSync } = require('fs');
const { imgToColors } = require('./colors');
const Repository = require("./repository");
const WorkerManager = require('./worker-manager');

function mapLayer(layer) {
    if(!layer)
        return layer;

    layer.Image = layer.Id + layer.ImageExt;
    layer.IsActive = WorkerManager.getCluster(layer.Name) != undefined;
    delete layer.ImageExt;

    return layer;
}

class LayersController {
    repository = new Repository("layers");

    async saveLayer(layer) {
        layer.Id ??= crypto.randomUUID();

        writeFileSync(`./public/layers/${layer.Id}.${layer.ImageExt}`, Buffer.from(layer.Image, "base64"));
        layer.Image = await imgToColors(`./public/layers/${layer.Id}.${layer.ImageExt}`);

        this.repository
            .addOrUpdate(layer.Id, layer)
            .saveChanges();
    }

    getLayer(id) {
        return mapLayer(this.repository.get(id));
    }

    getRawLayer(name) {
        return this.repository.data.find(x => x.Name == name);
    }

    getLayers() {
        return Object.values(this.repository.data).map(mapLayer);
    }
}

module.exports = new LayersController();