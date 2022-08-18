/**
 * Export bundle as an amd module
 *
 * @param code {string} The cjs code to be packaged
 * @param dependencies {object} The bundle dependencies
 * @return {string}
 */
module.exports = function (code, dependencies) {
    let output = '';

    const params = [...dependencies.values()].join(', ');
    const required = JSON.stringify([...dependencies.keys()].map(d => d.split('@')[0]));
    output += dependencies.register;
    output += `define(${required}, (${params}) => {\n`;

    dependencies.size && (output += '\n');
    output += `${dependencies.code}\n`;

    output += code;

    output += 'return module.exports;\n';
    output += '});\n\n';

    return output;
}