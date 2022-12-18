const fs = require('fs').promises;
const {join} = require('path');
const SEPARATOR = '\n![!SEPARATOR!]!\n';
const cwd = process.cwd();

module.exports = class {
    #dirname;
    #path;

    #error;
    get error() {
        return this.#error;
    }

    #initialised = false;

    constructor(container, id) {
        if (id.includes('/') || id.includes('\\')) throw new Error('Invalid id');

        this.#dirname = join(cwd, '.beyond/logs', container);
        this.#path = join(this.#dirname, id);
    }

    async #initialise() {
        if (this.#initialised) return;
        this.#initialised = true;

        await fs.mkdir(this.#dirname, {recursive: true});
    }

    async add(text, severity) {
        await this.#initialise();

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
