const https = require('https');
const extractor = require('./extractor');

module.exports = class {
    #pkg;
    #version;

    #found;
    get found() {
        return this.#found;
    }

    #files;
    get files() {
        return this.#files;
    }

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return this.#found && !this.#error;
    }

    constructor(pkg, version) {
        if (!pkg || !version) throw new Error('Invalid parameters');

        this.#pkg = pkg;
        this.#version = version;
    }

    process = () => new Promise(resolve => {
        const {unscoped, name, version} = (() => {
            const split = this.#pkg.split('/');
            const scope = split[0].startsWith('@') ? split.shift() : void 0;

            const unscoped = split.shift();
            const name = scope ? `${scope}/${unscoped}` : unscoped;
            return {name, unscoped, version: this.#version};
        })();

        const source = `https://registry.npmjs.org/${name}/-/${unscoped}-${version}.tgz`;
        const target = `${name}@${version}`;

        const {gunzip, extract} = extractor(target, ({error, files}) => {
            if (!this.valid) return;

            this.#files = files;
            this.#error = error?.message ? error.message : error;
            resolve();
        });

        const request = https.request(source, response => {
            if (response.statusCode === 404) {
                this.#found = false;
                resolve();
                return;
            }

            this.#found = true;
            if (response.statusCode !== 200) {
                this.#error = 'Response status was ' + response.statusCode;
                resolve();
                return;
            }

            response.pipe(gunzip).pipe(extract);
        });

        request.on('error', error => {
            if (!this.valid) return;

            this.#error = 'Unexpected error: ' + (error.message ? error.message : error);
            resolve();
        });

        request.end();
    });
}
