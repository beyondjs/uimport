const fs = require('fs').promises;
const {join} = require('path');
const SEPARATOR = '\n![!SEPARATOR!]!\n';
const cwd = process.cwd();

module.exports = class {
    #path;

    #error;
    get error() {
        return this.#error;
    }

    constructor(id) {
        this.#path = join(cwd, 'logs', id);
    }

    async add(text, severity) {
        severity = severity ? severity : 'INFO';
        const metadata = {severity};

        console.log(text);

        const value = JSON.stringify({metadata, text}) + SEPARATOR;
        await fs.appendFile(this.#path, value);
    }

    async get() {
        try {
            const entries = (await fs.readFile(this.#path)).split(SEPARATOR);
            return entries.map(entry => JSON.parse(entry));
        }
        catch (exc) {
            this.#error = exc.message;
        }
    }
}
