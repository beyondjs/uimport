const esbuild = require('esbuild');

module.exports = class {
    #errors;
    get errors() {
        return this.#errors ? this.#errors : [];
    }

    #warnings;
    get warnings() {
        return this.#warnings;
    }

    #paths;
    #metafile;

    get inputs() {
        return this.#metafile;
    }

    #importers;
    get importers() {
        return this.#importers;
    }

    constructor(paths) {
        this.#paths = paths;
    }

    async initialise() {
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
            return {errors: [exc.message]};
        }

        if (this.#errors.length) return;

        this.#importers = new (require('./inputs'))(this.#metafile);
    }
}
