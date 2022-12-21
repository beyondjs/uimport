const parser = require('./parser');
const register = require('./register');
const SourceMap = require('../sourcemap');

/**
 * Export bundle as an amd module
 *
 * @param pkg {{code:string, map: string, metafile: {bundle: string, version: string}}} The package
 * @param dependencies {object} The bundle dependencies
 * @param specs {{versions?: boolean, prePath?: string}}
 * @return {SourceMap}
 */
module.exports = function (pkg, dependencies, specs) {
    const sourcemap = new SourceMap();
    const required = JSON.stringify([...dependencies.graph.keys()].map(d => parser(d, specs)));
    const params = [...dependencies.graph.values()].join(', ');

    sourcemap.concat(`define(${required}, (${params}) => {`);
    if (specs.versions || specs.prePath) {
        sourcemap.concat(register('amd', pkg.metafile, dependencies, specs));
    }

    dependencies.graph.size && sourcemap.concat('\n');
    sourcemap.concat(`${dependencies.graph.code}`);
    sourcemap.concat(pkg.code, null, pkg.map);
    sourcemap.concat('return module.exports;');
    sourcemap.concat('});\n');

    return sourcemap;
}