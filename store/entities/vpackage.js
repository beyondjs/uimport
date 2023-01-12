const fs = require('fs').promises;
const {join} = require('path');
const cwd = process.cwd();

module.exports = class {
    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #version;
    get version() {
        return this.#version;
    }

    #dirname;
    #path;

    #value;
    get value() {
        return this.#value;
    }

    #read;

    constructor(pkg, version) {
        if (!pkg || !version) throw new Error('Invalid parameters');

        this.#pkg = pkg;
        this.#version = version;
        this.#dirname = join(cwd, '.beyond', 'registry', pkg, 'versions');
        this.#path = join(this.#dirname, `${version}.json`);
    }

    async load() {
        this.#read = true;

        const exists = await new Promise(resolve =>
            fs.access(this.#path).then(() => resolve(true)).catch(() => resolve(false)));
        if (!exists) return;

        try {
            const content = await fs.readFile(this.#path);
            this.#value = JSON.parse(content);
        }
        catch (exc) {
            console.log(`Error loading vpackage from store "${this.#path}": ${exc.message}`);
        }
    }

    async set(data) {
        !this.#read && await this.load();
        const value = this.#value ? this.#value : {};
        this.#value = Object.assign(value, data);

        try {
            await fs.mkdir(this.#dirname, {recursive: true});
            const content = JSON.stringify(this.#value);
            await fs.writeFile(this.#path, content);
        }
        catch (exc) {
            console.log(`Error saving vpackage info into store "${this.#path}": ${exc.message}`);
        }
    }
}
