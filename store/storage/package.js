const {join, dirname} = require('path');
const cwd = process.cwd();
const {createWriteStream} = require('fs');
const fs = require('fs').promises;

module.exports = class {
    #dirname;
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
        this.#path = join(cwd, '.beyond/packages', path);
        this.#dirname = dirname(this.#path);
    }

    async createWriteStream() {
        await fs.mkdir(this.#dirname, {recursive: true});
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
