const convert = require('convert-source-map');
const {relative, sep} = require('path');
/**
 * Build the bundle
 *
 * @param bundle {string} The bundle (package/subpath)
 * @param version {string} The package version
 * @param mode {string} Can be 'esm', 'sjs', 'amd'
 * @param specs {{cwd: string, temp: string, versions: boolean}}
 * @return {Promise<{code?: string, warnings?: string[], errors?: string[], dependencies?: {path: string, id: string}[]}>}
 */
module.exports = async function (bundle, version, mode, specs) {
    if (!['esm', 'sjs', 'amd'].includes(mode)) throw new Error('Invalid parameters');

    let errors, code, warnings, packaged, metafile;
    ({errors, warnings, packaged, metafile} = await (async () => {
        const process = async params => {
            const wrapper = await require('./wrapper')(bundle, version, params);
            const metafile = new (require('./metafile'))(bundle, version, wrapper, specs);
            await metafile.process();
            if (metafile.errors?.length) return {errors: metafile.errors};

            const {packaged, errors, warnings} = await require('./esbuild')(wrapper, specs, metafile);

            // Just to log to console in development environment
            !errors?.length && require('./logs')(metafile);

            return {packaged, errors, warnings, metafile};
        }

        let packaged, errors, warnings;

        // Try bundling with default export
        ({packaged, errors, warnings, metafile} = await process({default: true, path: specs.temp}));
        if (!errors) return {packaged, warnings, metafile};

        // Try without default export
        ({packaged, errors, warnings, metafile} = await process({default: false, path: specs.temp}));
        return {packaged, errors, warnings, metafile};
    })());
    if (errors) return {errors, warnings};

    let {exports, reexports} = require('cjs-module-lexer').parse(packaged.code);
    exports = exports.length ? exports : metafile.exports;

    // Transform the externals
    // Ex: node_modules/svelte/internal/internal.js => svelte/internal
    ({code, map, errors} = await require('./externals')(packaged, metafile, specs));
    if (errors?.length) return {errors};

    // Expose as an AMD module
    code = (() => {
        const dependencies = new (require('./dependencies'))(metafile, specs);
        ({code, map} = require('./module')({code, map}));
        const sourcemap = require('./mformat')(mode, {code, map, metafile}, dependencies, exports, reexports, specs);

        //out: external sourcemap directory
        const sourceRoot = relative(process.cwd(), `${specs.cwd}/out`);
        sourcemap.map.sourceRoot = sep === '/' ? sourceRoot : sourceRoot.replace(/\\/g, '/');
        sourcemap.map.sourceRoot = `/${sourcemap.map.sourceRoot}`;

        // removes the content of the sourcemap file
        delete sourcemap.map.sourcesContent;

        const inline = convert.fromObject(sourcemap.map).toComment();
        return sourcemap.code + '\n' + inline;
    })();

    const dependencies = [...metafile.dependencies.bundles.values()].map(bundle => ({
        id: bundle.id,
        path: bundle.pkg.path
    }));

    return {code, warnings, dependencies};
}
