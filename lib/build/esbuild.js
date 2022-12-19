const esbuild = require('esbuild');

/**
 * Package the bundle thanks to esbuild
 *
 * @param bundle {string} The bundle to be built
 * @param cwd {string} The working directory
 * @param metafile {object} The metafile
 * @return {Promise<{packaged?: string, errors?: string[], warnings?: string[]}>}
 */
module.exports = async function (bundle, cwd, metafile) {
    let outputFiles, warnings;
    try {
        let errors;
        const {bundles} = metafile.dependencies;
        const excluded = [...bundles.keys()].map(external => `./${external}`);

        ({outputFiles, errors, warnings} = await esbuild.build({
            absWorkingDir: cwd,
            entryPoints: [bundle],
            logLevel: 'silent',
            bundle: true,
            metafile: true,
            platform: 'browser',
            format: 'esm',
            write: false,
            treeShaking: true,
            external: excluded
        }));

        warnings = warnings.map(message => message.text);

        if (errors.length) {
            errors = errors.map(message => message.text);
            return {errors, warnings};
        }
    }
    catch (exc) {
        return {errors: [exc.message]};
    }

    const packaged = outputFiles[0].text;
    return {packaged, warnings};
}
