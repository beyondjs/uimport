const parser = require('./parser');

/**
 * Export bundle as an amd module
 *
 * @param code {string} The cjs code to be packaged
 * @param dependencies {object} The bundle dependencies
 * @param versions {boolean} flag to add version dependencies
 * @return {string}
 */
module.exports = function (code, dependencies, versions) {
    let output = '';

    const required = JSON.stringify([...dependencies.keys()].map(d => parser(d, versions)));
    const params = [...dependencies.values()].join(', ');
    output += dependencies.register;
    output += `define(${required}, (${params}) => {\n`;

    dependencies.size && (output += '\n');
    output += `${dependencies.code}\n`;

    output += code;

    output += 'return module.exports;\n';
    output += '});\n\n';

    return output;
}