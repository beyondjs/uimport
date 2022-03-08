const fs = require('fs').promises;

module.exports = async function (bundle, application, paths) {
    await fs.mkdir(paths.input.dirname, {recursive: true});
    await fs.writeFile(
        paths.input.fullpath,
        `export * from '${bundle}';`, 'utf8'
    );

    const metafile = new (require('./metafile'))(paths);
    await metafile.process();

    const dependencies = new (require('./dependencies'))(bundle, application, metafile.ims);
    dependencies.process();

    const {code, errors, warnings} = await require('./build')(paths, dependencies.externals);
    return {code, errors, warnings};
}
