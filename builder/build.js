const esbuild = require('esbuild');
const fs = require('fs').promises;

module.exports = async function (bundle, application, paths) {
    await fs.mkdir(paths.input.dirname, {recursive: true});
    await fs.writeFile(
        paths.input.fullpath,
        `export * from '${bundle}';`, 'utf8'
    );

    const metafile = new (require('./metafile'))(paths);
    await metafile.initialise();

    
    return;

    const {inputs} = metafile;
    let errors, externals, dependencies;
    ({externals, dependencies, errors} = require('./dependencies')(bundle, inputs, application));
    if (errors) return {errors};

    let outputFiles;
    try {
        ({outputFiles} = await esbuild.build({
            absWorkingDir: paths.inputs,
            entryPoints: [paths.input.relative],
            logLevel: 'silent',
            bundle: true,
            metafile: true,
            format: 'cjs',
            write: false,
            external: [...externals.values()],
            treeShaking: false
        }));
    }
    catch (exc) {
        return {errors: [exc.message]};
    }

    const packaged = outputFiles[0].text;

    // Transform the dependencies
    // Ex: node_modules/svelte/internal/internal.js => svelte/internal
    let code;
    ({code, errors} = require('./dependencies/transform')(packaged, dependencies, application));
    if (errors?.length) return {errors};

    // Expose as an AMD module
    code = require('./amd')(code, externals);
    return {code};
}
