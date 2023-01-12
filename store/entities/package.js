const fs = require('fs').promises;
const {join} = require('path');
const cwd = process.cwd();

module.exports = class {
    #name;
    get name() {
        return this.#name;
    }

    #dirname;
    #path;

    #value;
    get value() {
        return this.#value;
    }

    #read;

    constructor(name) {
        this.#name = name;
        this.#dirname = join(cwd, '.beyond/registry', name);
        this.#path = join(this.#dirname, 'package.json');
    }

    async load() {
        this.#read = true;

        const exists = await new Promise(resolve =>
            fs.access(this.#path).then(() => resolve(true)).catch(() => resolve(false)));
        if (!exists) return;

        try {
            const content = await fs.readFile(this.#path, 'utf8');
            this.#value = JSON.parse(content);
        }
        catch (exc) {
            console.log(`Error loading package from store "${this.#path}": ${exc.message}`);
        }
    }

    async set(data) {
        !this.#read && await this.load();
        const value = this.#value ? this.#value : {};

        try {
            await fs.mkdir(this.#dirname, {recursive: true});
            const content = JSON.stringify(Object.assign(value, data));
            await fs.writeFile(this.#path, content);
        }
        catch (exc) {
            console.log(`Error saving package info into store "${this.#path}": ${exc.message}`);
        }
    }
}
