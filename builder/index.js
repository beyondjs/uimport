const fs = require('fs').promises;

module.exports = async function (bundle, application, paths) {
    await fs.mkdir(paths.input.dirname, {recursive: true});
    await fs.writeFile(
        paths.input.fullpath,
        `export * from '${bundle}';`, 'utf8'
    );

    const metafile = new (require('./metafile'))(paths);
    await metafile.process();

    const dependencies = new (require('./dependencies'))(metafile);


    return {code: ''};

    // const {inputs} = metafile;
    // let errors, externals, dependencies;
    // ({externals, dependencies, errors} = require('./dependencies')(bundle, inputs, application));
    // if (errors) return {errors};

}
