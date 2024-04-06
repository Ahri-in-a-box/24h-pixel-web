function initExtensions () {
    const extensions = {
        groupBy: function (selector) {
            const result = {};

            this.forEach(x => {
                const key = selector(x);
                result[key] ??= [];
                result[key].push(x);
            });

            return result;
        },
        regroup: function (lambda, filter) {
            const result = [];

            for (let i = 1; i < this.length; i++) {
                if (typeof (filter) !== "function" || filter(this[i - 1], this[i])) {
                    result.push(lambda(this[i - 1], this[i]));
                }
            }

            return result;
        },
        sum: function (selector) {
            selector ??= x => x;
            return this.reduce((prec, curr) => prec + parseInt(selector(curr)), 0);
        },
        shuffle: function() {
            const result = [...this];
            let ind = this.length;

            while(ind > 0) {
                let rand = Math.floor(Math.random() * ind);
                ind--;
                [result[ind], result[rand]] = [result[rand], result[ind]];
            }

            return result;
        }
    };

    const prototype = new Array().constructor.prototype;

    Object.entries(extensions)
        .filter(([_, value]) => typeof (value) === "function")
        .forEach(([key, fn]) => Object.defineProperty(prototype, key, {
            value: fn
        }));
}

module.exports = initExtensions();