const esbuild = require('esbuild');

module.exports = class {
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

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #paths;
    #metafile;

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
                format: 'cjs',
                write: false,
                treeShaking: false
            });

            this.#errors = errors;
            this.#warnings = warnings;
            this.#metafile = metafile;
        }
        catch (exc) {
            this.#errors = [exc.message];
            return;
        }

        if (this.#errors.length) return {errors: this.#errors};

        this.#ims = new (require('./ims'))(this.#metafile, this.#paths);

        // Roots are the im that doesn't have consumers of their own bundle container
        this.#roots = new Map([...this.#ims].filter(([, im]) => {
            return ![...im.consumers.values()].filter(consumer => consumer.container === im.container).length;
        }));

        this.#externals = new (require('./externals'))(this);
    }
}
