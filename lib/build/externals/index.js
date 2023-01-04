const {transformAsync: transform} = require('@babel/core');
const createBabelPlugin = require('./babel-plugin');
const SourceMap = require('../sourcemap');

/**
 * Transforms the esbuild imports to global imports
 * Ex: node_modules/svelte/internal/internal.js => svelte/internal
 */
module.exports = async function ({code, map}, metafile, {versions, cwd}) {
    const plugin = createBabelPlugin(metafile, versions);

    let transformed;
    try {
        transformed = await transform(code, {
            cwd,
            sourceType: 'module',
            inputSourceMap: JSON.parse(map),
            ast: false,
            code: true,
            compact: false,
            sourceMaps: true,
            plugins: [plugin]
        });
    }
    catch (e) {
        return {errors: [e.message]};
    }

    const sourcemap = new SourceMap();
    sourcemap.concat(transformed.code, null, transformed.map);

    return sourcemap;
}
