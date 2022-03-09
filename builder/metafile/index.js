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

    #application;
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
     * @param application {object} The application object
     * @param paths {{inputs: string, cache: string, input: {relative: string, fullpath: string, dirname: string}}}
     */
    constructor(bundle, application, paths) {
        this.#bundle = bundle;
        this.#application = application;
        this.#paths = paths;
    }

    async process() {
        const paths = this.#paths;

        try {
            const {errors, warnings, metafile} = await esbuild.build({
                absWorkingDir: paths.inputs,
                entryPoints: [paths.input.relative],
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

        this.#ims = new (require('./ims'))(this.#metafile, this.#application);

        // Roots are the im that doesn't have consumers of their own bundle container
        this.#roots = new Map([...this.#ims].filter(([, im]) => {
            return ![...im.consumers.values()].filter(consumer => consumer.container === im.container).length;
        }));

        this.#externals = new (require('./externals'))(this);
    }
}
