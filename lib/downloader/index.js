const {PendingPromise} = require('uimport/utils');
const fs = require('fs').promises;
const https = require('https');

module.exports = class {
    #vpackage;
    #specs;

    constructor(vpackage, specs) {
        if (!specs?.cache) throw new Error('Invalid specification');

        this.#vpackage = vpackage;
        this.#specs = specs;
    }

    get target() {
        // Check if package is already downloaded
        const {name, version} = this.#vpackage;
        return require('path').join(this.#specs.cache, 'downloads', `${name}@${version}`);
    }

    /**
     * Check if vpackage is already downloaded
     */
    async downloaded() {
        return false;
    }

    /**
     * Check if vpackage is already downloaded and unzipped
     */
    async unzipped() {

    }

    #promise;

    async fetch() {
        if (this.#promise) {
            await this.#promise;
            return;
        }

        this.#promise = new PendingPromise();
        const done = () => this.#promise = this.#promise.resolve();

        const {name, version} = this.#vpackage;
        const source = `https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`;
        const file = fs.createWriteStream(this.target);

        console.log(source, this.target);
        // const request = https.get(source, function (response) {
        //     response.pipe(file);
        //
        //     // After download completed close filestream
        //     file.on('finish', () => {
        //         file.close();
        //         done();
        //     });
        // });
    }
}
