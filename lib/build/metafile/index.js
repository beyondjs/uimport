const esbuild = require('esbuild');

module.exports = class {
    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #version;
    get version() {
        return this.#version;
    }

    #wrapper;
    get wrapper() {
        return this.#wrapper;
    }

    #cwd;
    #metafile;

    // The packages that are required by the bundle being packaged
    #packages;
    get packages() {
        return this.#packages;
    }

    // The dependencies that are required by the bundle being packaged
    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #ims;
    get ims() {
        return this.#ims;
    }

    #roots;
    get roots() {
        return this.#roots;
    }

    #externals;
    get externals() {
        return this.#externals;
    }

    #exports;
    get exports() {
        return this.#exports;
    }

    #errors;
    get errors() {
        return this.#errors ? this.#errors : [];
    }

    get valid() {
        return !this.#errors?.length;
    }

    #warnings;
    get warnings() {
        return this.#warnings;
    }

    /**
     * Metafile constructor
     *
     * @param bundle {string} The name of the bundle being packaged
     * @param version {string} The version of the bundle being packaged
     * @param wrapper {string} The location of the wrapper code of the bundle being packaged
     * @param cwd {string} The working directory
     */
    constructor(bundle, version, wrapper, {cwd}) {
        this.#bundle = bundle;
        this.#version = version;
        this.#wrapper = wrapper;
        this.#cwd = cwd;
    }

    async process() {
        try {
            const {errors, warnings, metafile} = await esbuild.build({
                entryPoints: [this.#wrapper],
                absWorkingDir: this.#cwd,
                logLevel: 'silent',
                bundle: true,
                metafile: true,
                platform: 'browser',
                format: 'esm',
                write: false,
                treeShaking: false
            });

            this.#errors = errors;
            this.#warnings = warnings;
            this.#metafile = metafile;
            if (errors.length) return;
        }
        catch (exc) {
            this.#errors = ['ERROR creating metafile:', exc.message];
            return;
        }

        this.#exports = Object.values(this.#metafile.outputs)[0].exports;

        this.#ims = new (require('./ims'))(this.#metafile);
        if (!this.#ims.valid) {
            this.#errors = this.#ims.errors;
            return;
        }

        this.#packages = new (require('./packages'))(this.#ims, {cwd: this.#cwd});
        await this.#packages.process();
        if (!this.#packages.valid) {
            this.#errors = this.#packages.errors;
            return;
        }

        this.#dependencies = new (require('./dependencies'))(this.#bundle, this.#ims, this.#packages);
    }
}
