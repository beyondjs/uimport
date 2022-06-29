const fs = require('fs').promises;
const {join} = require('path');

/**
 * Being a uimport package, bundles are already packaged and ready to be returned
 *
 * @param pkg {string} The package name
 * @param subpath {string} The subpath
 * @param mode {string} Can be 'amd', 'esm'
 * @return {Promise<{code?: string}|{errors?: string[]}>}
 */
module.exports = async function (pkg, subpath, mode) {
    const {json} = pkg;
    const {uimport} = json;
    if (!uimport) return {};

    // It is a uimport package, so it is not required to package the bundle being requested
    const entry = mode === 'esm' ? 'module' : (mode === 'cjs' ? 'require' : 'amd');

    if (!json[entry]) return {
        errors: [`Subpath "./${subpath}" of package "${pkg}" ` +
        `has no "${entry}" specification on its conditional exports`]
    };

    try {
        const file = join(pkg.path, json[entry]);
        const code = await fs.readFile(file, 'utf8');
        return {code};
    }
    catch (exc) {
        return {errors: [exc.message]};
    }
}