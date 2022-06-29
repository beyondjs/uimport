/**
 * Export bundle as a esm module
 *
 * @param code {string} The cjs code to be packaged
 * @param metafile {object} The parsed metafile object
 * @param exports {string[]} The list of exported names
 * @param reexports {string[]} The list of reexported names
 * @return {string}
 */
module.exports = function (code, metafile, exports, reexports) {
    void (reexports); // Actually unused

    let output = '';
    const dependencies = new (require('./dependencies'))(metafile);

    dependencies.forEach((variable, bundle) => {
        output += `import * as ${variable} from '${bundle}';\n`;
    });

    dependencies.size && (output += '\n');
    output += `${dependencies.code}\n`;

    output += require('./module')(code);

    output += `const {${exports.join(',')}} = module.exports;\n`;
    output += `export {${exports.join(',')}};\n`;
    return output;
}