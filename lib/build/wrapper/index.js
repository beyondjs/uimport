const {join, dirname} = require('path');
const fs = require('fs').promises;

/**
 * The wrapper file is required for the parsing of the named exports to work (cjs-module-lexer)
 *
 * @param bundle {string} The bundle name (package / subpath)
 * @param version {string} The version of the package
 * @param specs {{default: boolean, path: string}} Export the default
 * @return {Promise<string>}
 */
module.exports = async function (bundle, version, specs) {
    await fs.mkdir(specs.path, {recursive: true});
    let wrapper = `export * from '${bundle}';`;

    wrapper += !specs.default ? '' : '\n\n' +
        `import _default from '${bundle}';\n` +
        `export default _default;`;

    const file = join(specs.path, `${bundle}.${version}.js`);
    await fs.mkdir(dirname(file), {recursive: true});
    await fs.writeFile(file, wrapper, 'utf8');

    return file;
}
