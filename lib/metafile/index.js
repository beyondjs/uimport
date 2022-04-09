const esbuild = require('esbuild');

module.exports = class {
    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #paths;
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
     * @param bundle {string} The bundle being packaged
     * @param paths {{absWorkingDir: string, temp: string, entryPoint: string}}
     */
    constructor(bundle, paths) {
        this.#paths = paths;
        this.#bundle = bundle;
    }

    async process() {
        try {
            const {errors, warnings, metafile} = await esbuild.build({
                absWorkingDir: this.#paths.cwd,
                entryPoints: [this.#paths.entryPoint],
                logLevel: 'silent',
                bundle: true,
                metafile: true,
                platform: 'browser',
                format: 'cjs',
                write: false,
                treeShaking: false
            });

            this.#errors = errors;
            this.#warnings = warnings;
            this.#metafile = metafile;
            if (errors.length) return;
        }
        catch (exc) {
            this.#errors = [exc.message];
            return;
        }

        this.#ims = new (require('./ims'))(this.#metafile);
        if (!this.#ims.valid) {
            this.#errors = this.#ims.errors;
            return;
        }

        this.#packages = new (require('./packages'))(this.#ims, this.#paths);
        if (!this.#packages.valid) {
            this.#errors = this.#packages.errors;
            return;
        }

        this.#dependencies = new (require('./dependencies'))(this.#ims, this.#packages);
    }
}
