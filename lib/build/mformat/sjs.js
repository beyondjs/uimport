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
    output += `System.register(${required}, function(_exports, _context) => {\n`;
    output += 'var dependencies;\n';
    output += 'var require = dependency => dependencies.get(dependency);\n';
    output += 'return {\n';

    const deps = [...dependencies.values()].join(', ');
    output += `setters: [function (${deps}){\n`;

    const entries = [...dependencies].map(([dependency, param]) => `['${dependency}', ${param}]`);
    output += `dependencies = new Map([${entries}]);\n`;
    output += '}],\n';
    output += 'execute: function() {\n';
    output += code;
    output += `_exports(module.exports);\n`;
    output += '});\n\n';

    return output;
}
