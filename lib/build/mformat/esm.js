const parser = require('./parser');
const register = require('./register');

/**
 * Export bundle as an esm module
 *
 * @param pkg {{code:string, metafile: {bundle: string, version: string}}} The package
 * @param dependencies {object} The bundle dependencies
 * @param specs {{versions?: boolean, prePath?: string}}
 * @param exports {string[]} The list of exported names
 * @param reexports {string[]} The list of reexported names
 * @return {string}
 */
module.exports = function (pkg, dependencies, specs, exports, reexports) {
    void (reexports); // Actually unused

    let output = '';
    dependencies.forEach((variable, bundle) =>
        output += `import * as ${variable} from '${parser(bundle, specs)}';\n`
    );

    if (specs.versions || specs.prePath) {
        output += register('esm', pkg.metafile, dependencies, specs);
    }

    dependencies.size && (output += '\n');
    output += `${dependencies.code}\n`;

    output += pkg.code;

    const named = new Set(exports);
    const def = named.has('default');
    named.delete('default');
    named.delete('__esModule');
    const vars = [...named].join(',');

    output += def ? 'export default module.exports;\n' : '';

    if (vars) {
        output += `const {${vars}} = module.exports;\n`;
        output += `export {${vars}};\n`;
    }

    return output;
}