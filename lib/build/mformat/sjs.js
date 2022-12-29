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

    sourcemap.concat(`System.register(${required}, (_exports, _context) => {`);
    if (specs.versions || specs.prePath) {
        sourcemap.concat(register('sjs', pkg.metafile, dependencies, specs));
    }
    sourcemap.concat('\nvar dependencies = new Map();');
    sourcemap.concat('var require = dependency => dependencies.get(dependency);');
    sourcemap.concat('return {');

    const setters = [...dependencies.graph.keys()].map(dependency =>
        `dep => dependencies.set('${parser(dependency, specs)}', dep)`).join(', ');
    sourcemap.concat(`setters: [${setters}],`);

    // hack - to widgets
    const hacked = pkg.code.replaceAll('import_meta.url', '_context.meta.url');

    sourcemap.concat('execute: function() {');
    sourcemap.concat(hacked, null, pkg.map);
    sourcemap.concat(`_exports(module.exports);`);
    sourcemap.concat('}}});\n');

    return sourcemap;
}
