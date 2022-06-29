/**
 * Export bundle as an amd module
 *
 * @param code {string} The cjs code to be packaged
 * @param metafile {object} The parsed metafile object
 * @return {string}
 */
module.exports = function (code, metafile) {
    let output = '';
    const dependencies = new (require('./dependencies'))(metafile);

    const required = JSON.stringify([...dependencies.keys()]);
    const params = [...dependencies.values()].join(', ');
    output += `define(${required}, (${params}) => {\n`;

    dependencies.size && (output += '\n');
    output += `${dependencies.code}\n`;

    output += 'const define = void 0;\n';

    output += require('./module')(code);

    output += 'return module.exports;\n';
    output += '});\n\n';

    return output;
}
