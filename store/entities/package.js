const fs = require('fs').promises;
const {join} = require('path');
const cwd = process.cwd();

module.exports = class {
    #name;
    get name() {
        return this.#name;
    }

    #path;

    #value;
    get value() {
        return this.#value;
    }

    #read;

    constructor(name) {
        this.#name = name;
        this.#path = join(cwd, '.beyond', 'registry', name, 'package.json');
    }

    async load() {
        const exists = await new Promise(resolve =>
            fs.access(this.#path).then(() => resolve(true)).catch(() => resolve(false)));
        if (!exists) return;

        this.#read = true;
        const content = await fs.readFile(this.#path);
        this.#value = JSON.parse(content);
    }

    async set(data) {
        !this.#read && await this.load();
        const value = this.#value ? this.#value : {};

        const content = JSON.stringify(Object.assign(value, data));
        await fs.writeFile(this.#path, content);
    }
}
