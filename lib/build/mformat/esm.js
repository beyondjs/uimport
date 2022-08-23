/**
 * Export bundle as an esm module
 *
 * @param code {string} The cjs code to be packaged
 * @param dependencies {object} The bundle dependencies
 * @param exports {string[]} The list of exported names
 * @param reexports {string[]} The list of reexported names
 * @return {string}
 */
module.exports = function (code, dependencies, exports, reexports) {
    void (reexports); // Actually unused

    const regExp = /@(\d\.?)+/;
    let output = '';
    output += dependencies.register;
    dependencies.forEach((variable, bundle) =>
        output += `import * as ${variable} from '${bundle.replace(regExp, '')}';\n`
    );

    dependencies.size && (output += '\n');
    output += `${dependencies.code}\n`;

    output += code;

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