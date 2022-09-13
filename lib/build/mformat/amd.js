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
    const required = JSON.stringify([...dependencies.graph.keys()].map(d => parser(d, specs)));
    const params = [...dependencies.graph.values()].join(', ');

    let output = `define(${required}, (${params}) => {\n`;
    if (specs.versions || specs.prePath) {
        output += register('amd', pkg.metafile, dependencies, specs);
    }

    dependencies.graph.size && (output += '\n');
    output += `${dependencies.graph.code}\n`;

    output += pkg.code;

    output += 'return module.exports;\n';
    output += '});\n\n';

    return output;
}