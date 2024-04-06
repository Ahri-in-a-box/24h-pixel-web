const { readFileSync, writeFileSync } = require('fs');

class Repository {
    data = {};

    constructor(filename) {
        this.path = `./persistence/${filename}.json`;
        this.data = JSON.parse(readFileSync(this.path, "utf-8"))
    }

    get(id) {
        return this.data[id];
    }

    add(id, content) {
        if(this.data[id])
            throw new Error(`Data already exists for id ${id}`);

        this.data[id] = content;
        return this;
    }

    update(id, content) {
        if(!this.data[id])
            throw new Error(`No data for id ${id}`);

        this.data[id] = content;
        return this;
    }

    addOrUpdate(id, content) {
        this.data[id] = content;
        return this;
    }

    remove(id) {
        if(!this.data[id])
            throw new Error(`No data for id ${id}`);

        delete this.data[id];
        return this;
    }

    saveChanges() {
        writeFileSync(this.path, JSON.stringify(this.data));
    }
}

module.exports = Repository;