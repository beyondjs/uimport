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

    #path;

    #value;
    get value() {
        return this.#value;
    }

    #read;

    constructor(pkg, version) {
        this.#pkg = pkg;
        this.#version = version;
        this.#path = join(cwd, '.beyond', 'registry', pkg, `${version}.json`);
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
        this.#value = Object.assign(value, data);

        const content = JSON.stringify(this.#value);
        await fs.writeFile(this.#path, content);
    }
}
