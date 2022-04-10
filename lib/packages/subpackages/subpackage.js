module.exports = class {
    #error;
    get error() {
        return this.#error;
    }

    #name;
    get name() {
        return this.#name;
    }

    #entry;
    get entry() {
        return this.#entry;
    }

    constructor(path, name) {
        this.#name = name;

        try {
            const json = require(`${path}/package.json`);

            this.#entry = (() => {
                if (json.browser) return json.browser;
                if (json.module) return json.module;
                if (json.main) return json.main;

                return '';
            })();
        }
        catch (exc) {
            this.#error.push(`Subpackage "${path}" is invalid`);
        }
    }
}
