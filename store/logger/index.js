const fs = require('fs').promises;
const {join, dirname} = require('path');
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

    constructor({container, pkg, version}) {
        if (!container || !pkg || !version) throw new Error('Invalid parameters');
        // Actually only 'modules.create' container is expected
        if (!['modules.create'].includes(container)) throw new Error('Action "${container}" not found');

        if (container.includes('/') || container.includes('\\')) throw new Error('Invalid container specification');

        this.#path = join(cwd, '.beyond/logs/packager', `${pkg}@${version}.json`);
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
