const fs = require('fs').promises;
const {join, dirname} = require('path');
const SEPARATOR = '\n![!SEPARATOR!]!\n';
const cwd = process.cwd();
const md5 = require('@beyond-js/md5');

module.exports = class {
    #id;
    #dirname;
    #path;

    #error;
    get error() {
        return this.#error;
    }

    #initialised = false;

    constructor(id) {
        if (!id) throw new Error('Invalid parameters');
        this.#id = md5(id);
        this.#path = join(cwd, '.beyond/logs', this.#id);
        this.#dirname = dirname(this.#path);
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

        const value = JSON.stringify({metadata, data: text}) + SEPARATOR;
        await fs.appendFile(this.#path, value);
    }

    async get() {
        try {
            const content = (await fs.readFile(this.#path)).toString();
            const entries = content.split(SEPARATOR);
            return entries.filter(entry => !!entry).map(entry => JSON.parse(entry));
        }
        catch (exc) {
            this.#error = exc.message;
        }
    }
}
