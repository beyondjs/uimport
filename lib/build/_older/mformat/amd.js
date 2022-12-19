/**
 * Export bundle as an amd module
 *
 * @param code {string} The cjs code to be packaged
 * @param dependencies {object} The bundle dependencies
 * @return {string}
 */
module.exports = function (code, dependencies) {
    let output = '';

    const required = JSON.stringify([...dependencies.keys()]);
    const params = [...dependencies.values()].join(', ');
    output += `define(${required}, (${params}) => {\n`;

    dependencies.size && (output += '\n');
    output += `${dependencies.code}\n`;

    output += code;

    output += 'return module.exports;\n';
    output += '});\n\n';

    return output;
}
