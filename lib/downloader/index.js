const {PendingPromise} = require('uimport/utils');
const {promises: fs, unlink, createWriteStream, createReadStream} = require('fs');
const https = require('https');
const tar = require('tar-stream');
const zlib = require('zlib');
const {sep, join} = require('path');

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
        const dir = join(this.#specs.cache, `${name}@${version}`);
        const file = join(this.#specs.cache, `${name}@${version}.tgz`);
        return {file, dir};
    }

    /**
     * Check if vpackage is already downloaded
     */
    async #downloaded() {
        const {file} = this.target;
        return await new Promise(resolve =>
            fs.access(file).then(() => resolve(true)).catch(() => resolve(false)));
    }

    /**
     * Check if vpackage is already downloaded and unzipped
     */
    async #unzipped() {
        const {dir} = this.target;
        return await new Promise(resolve =>
            fs.access(dir).then(() => resolve(true)).catch(() => resolve(false)));
    }

    #promises = {};

    async #fetch() {
        if (this.#promises.fetch) {
            await this.#promises.fetch;
            return;
        }

        const promise = this.#promises.fetch = new PendingPromise();

        // Check if file is already downloaded
        const downloaded = await this.#downloaded();
        if (downloaded) {
            promise.resolve();
            return;
        }

        const done = error => {
            error && unlink(target, () => void 0);

            // After download completed close filestream
            file.close();

            error ? promise.reject(error) : promise.resolve();
        }

        const {name, version} = this.#vpackage;
        const source = `https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`;
        await fs.mkdir(this.#specs.cache, {recursive: true});
        const {file: target} = this.target;

        const file = createWriteStream(target).on('finish', done);

        const request = https.request(source, response => {
            if (response.statusCode !== 200) {
                done('Response status was ' + response.statusCode);
                return;
            }

            response.on('data', chunk => file.write(chunk));
            response.on('end', () => response.completed && file.end());
        });
        request.end();
        request.on('error', error => {
            file.end();
            done(error);
        });
    }

    /**
     * Download and unzip
     *
     * @return {Promise<void>}
     */
    async process() {
        if (this.#promises.unzip) {
            await this.#promises.unzip;
            return;
        }

        const promise = this.#promises.unzip = new PendingPromise();

        // Check if file is already downloaded
        const unzipped = await this.#unzipped();
        if (unzipped) {
            promise.resolve();
            return;
        }

        // File must be previously downloaded
        try {
            await this.#fetch();
        }
        catch (exc) {
            promise.reject(exc);
            return;
        }


        const {dir} = this.target;
        const extract = tar.extract();

        const done = error => error ? promise.reject(error) : promise.resolve();

        let chunks = [];
        extract.on('entry', function (header, stream, next) {
            stream.on('data', chunk => chunks.push(chunk));

            stream.on('end', () => {
                const file = (() => {
                    const file = header.name.split(sep);
                    file[0] === 'package' && file.shift();
                    return join(dir, file.join('/'));
                })();

                const data = Buffer.concat(chunks);
                chunks.length = 0;
                const dirname = require('path').dirname(file);

                fs.mkdir(dirname, {recursive: true})
                    .then(() => fs.writeFile(file, data))
                    .then(next);
            });

            stream.resume();
        });

        extract.on('finish', () => done());

        createReadStream(this.target.file)
            .pipe(zlib.createGunzip())
            .pipe(extract);
    }
}
