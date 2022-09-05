const parser = require('./parser');
const register = require('./register');

/**
 * Export bundle as an amd module
 *
 * @param pkg {{code:string, metafile: {bundle: string, version: string}}} The package
 * @param dependencies {object} The bundle dependencies
 * @param specs {{versions?: boolean, prePath?: string}}
 * @return {string}
 */
module.exports = function (pkg, dependencies, specs) {
    let output = '';

    const required = JSON.stringify([...dependencies.keys()].map(d => parser(d, specs)));

    if (specs.versions || specs.prePath) {
        output += register('sjs', pkg.metafile, dependencies, specs);
    }
    output += `System.register(${required}, (_exports, _context) => {\n`;
    output += 'var dependencies = new Map();\n';
    output += 'var require = dependency => dependencies.get(dependency);\n';
    output += 'return {\n';

    const setters = [...dependencies.keys()].map(dependency =>
        `dep => dependencies.set('${parser(dependency, specs)}', dep)`).join(', ');
    output += `setters: [${setters}],\n`;

    output += 'execute: function() {\n';
    output += pkg.code;
    output += `_exports(module.exports);\n`;
    output += '}}});\n\n';

    return output;
}
