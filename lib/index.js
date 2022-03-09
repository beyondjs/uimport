const fs = require('fs').promises;
const p = require('path');

module.exports = async function (bundle, absWorkingDir, cacheDir) {
    cacheDir = p.join(cacheDir, bundle);
    const entryPoint = p.join(cacheDir, 'input.js');

    await fs.mkdir(cacheDir, {recursive: true});
    await fs.writeFile(
        entryPoint,
        `export * from '${bundle}';`, 'utf8'
    );

    const metafile = new (require('./metafile'))(bundle, absWorkingDir, entryPoint);
    await metafile.process();
    if (!metafile.valid) return {errors: metafile.errors};

    const {code, errors, warnings} = await require('./build')(absWorkingDir, entryPoint, paths, metafile.externals);
    return {code, errors, warnings};
}
