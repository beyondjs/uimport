const {join} = require('path');
const cwd = process.cwd();
const {createWriteStream} = require('fs');
const fs = require('fs').promises;

module.exports = class {
    #path;

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    #content;
    get content() {
        return this.#content;
    }

    constructor(path) {
        this.#path = join(cwd, 'packages', path);
    }

    createWriteStream() {
        return createWriteStream(this.#path);
    }

    async load() {
        try {
            this.#content = await fs.readFile(this.#path);
        }
        catch (exc) {
            this.#error = exc.message;
        }
    }
}
