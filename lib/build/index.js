const esbuild = require('esbuild');

module.exports = async function (paths, metafile) {
    let outputFiles, warnings;
    try {
        let errors;
        const {bundles} = metafile.dependencies;
        const excluded = [...bundles.keys()].map(external => `./${external}`);

        // @TODO: Remove the commented lines
        // console.log(excluded);
        // excluded.push('./node_modules/@mui/material/styles/*');
        // excluded.push('./node_modules/@mui/material/colors/*');

        ({outputFiles, errors, warnings} = await esbuild.build({
            absWorkingDir: paths.cwd,
            entryPoints: [paths.entryPoint],
            logLevel: 'silent',
            bundle: true,
            metafile: true,
            platform: 'browser',
            format: 'cjs',
            write: false,
            treeShaking: false,
            external: excluded
        }));
        if (errors.length) return {errors, warnings};
    }
    catch (exc) {
        return {errors: [exc.message]};
    }

    const packaged = outputFiles[0].text;

    // Transform the externals
    // Ex: node_modules/svelte/internal/internal.js => svelte/internal
    let code, errors;
    ({code, errors} = require('./externals')(packaged, metafile));
    if (errors?.length) return {errors};

    // Expose as an AMD module
    (code = require('./amd')(code, metafile));
    return {code, warnings};
}
