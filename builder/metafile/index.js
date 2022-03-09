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

    #ims;
    get ims() {
        return this.#ims;
    }

    #roots;
    get roots() {
        return this.#roots;
    }

    /**
     * Metafile constructor
     *
     * @param paths {{inputs: string, cache: string, input: {relative: string, fullpath: string, dirname: string}}}
     */
    constructor(paths) {
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
            return {errors: [exc.message]};
        }

        if (this.#errors.length) return;

        this.#ims = new (require('./ims'))(this.#metafile);

        // Roots are the im that doesn't have consumers of their own package
        this.#roots = new Map([...this.#ims].filter(([, im]) =>
            ![...im.consumers.values()].filter(consumer => consumer.pkg === im.pkg).length
        ));
    }
}
