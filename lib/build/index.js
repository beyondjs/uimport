/**
 * Build the bundle
 *
 * @param bundle {string} The bundle (package/subpath)
 * @param version {string} The package version
 * @param mode {string} Can be 'esm', 'sjs', 'amd'
 * @param paths {{cwd: string, temp: string}}
 * @return {Promise<{code?: string, warnings?: string[], errors?: string[], dependencies?: {path: string, id: string}[]}>}
 */
module.exports = async function (bundle, version, mode, paths) {
    if (!['esm', 'sjs', 'amd'].includes(mode)) throw new Error('Invalid parameters');

    const {errors, warnings, packaged, metafile} = await (async () => {
        const metafile = new (require('./metafile'))(bundle, paths.cwd);
        await metafile.process();
        if (metafile.errors?.length) return {errors: metafile.errors};

        const {packaged, errors, warnings} = await require('./esbuild')(bundle, paths.cwd, metafile);

        // Just to log to console in development environment
        !errors?.length && require('./logs')(metafile);

        return errors?.length ? {errors, warnings} : {packaged, warnings, metafile};
    })();
    if (errors) return {errors, warnings};

    // Transform the externals
    // Ex: node_modules/svelte/internal/internal.js => svelte/internal
    // ({code, errors} = require('./externals')(packaged, metafile));
    // if (errors?.length) return {errors};

    const dependencies = [...metafile.dependencies.bundles.values()].map(bundle => ({
        id: bundle.id,
        path: bundle.pkg.path
    }));

    return {code: packaged, warnings, dependencies};
}
