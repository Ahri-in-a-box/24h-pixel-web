const timeout = 11;

class Task {
    constructor(fetchResult) {
        this._id = crypto.randomUUID();
        this._result = undefined;
        this._ended = false;
        
        this.fetchResult = fetchResult;
        this.controller = new AbortController();
        this.signal = this.controller.signal;
    }

    get id() {
        return this._id;
    }

    get status() {
        return this._status;
    }

    get result() {
        return this._result;
    }

    set result(val) {
        this._result = val;
    }

    execute() {
        return new Promise(async (resolve, reject) => {
            const result = await this.fetchResult(this.signal);

            if(!result.ok) {
                this.result = await result.text();

                if(result.status == 400) {
                    setTimeout(reject, timeout * 1000, this.result);
                } else {
                    reject(this.result);
                }
                
                return;
            }

            this.result = await result.json();
            setTimeout(resolve, timeout * 1000, this.result);
        });
    }

    abort() {
        this.controller.abort();
    }
}

module.exports = Task;