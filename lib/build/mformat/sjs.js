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
    output += `System.register(${required}, (_exports, _context) => {\n`;
    output += 'var dependencies = new Map();\n';
    output += 'var require = dependency => dependencies.get(dependency);\n';
    output += 'return {\n';

    const setters = [...dependencies.keys()].map(dependency =>
        `dep => dependencies.set('${dependency}', dep)`).join(', ');
    output += `setters: [${setters}],\n`;

    output += 'execute: function() {\n';
    output += code;
    output += `_exports(module.exports);\n`;
    output += '}}});\n\n';

    return output;
}
