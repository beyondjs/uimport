const parser = require('./parser');
const register = require('./register');
const SourceMap = require('../sourcemap');

/**
 * Export bundle as an esm module
 *
 * @param pkg {{code:string, map: string, metafile: {bundle: string, version: string}}} The package
 * @param dependencies {object} The bundle dependencies
 * @param specs {{versions?: boolean, prePath?: string}}
 * @param exports {string[]} The list of exported names
 * @param reexports {string[]} The list of reexported names
 * @return {SourceMap}
 */
module.exports = function (pkg, dependencies, specs, exports, reexports) {
    void (reexports); // Actually unused

    const sourcemap = new SourceMap();
    dependencies.graph.forEach((variable, bundle) =>
        sourcemap.concat(`import * as ${variable} from '${parser(bundle, specs)}';`)
    );

    if (specs.versions || specs.prePath) {
        sourcemap.concat(register('esm', pkg.metafile, dependencies, specs));
    }

    dependencies.graph.size && sourcemap.concat('\n');
    sourcemap.concat(`${dependencies.graph.code}`);
    sourcemap.concat(pkg.code, null, pkg.map);

    const named = new Set(exports);
    const def = named.has('default');
    named.delete('default');
    named.delete('__esModule');
    const vars = [...named].join(',');

    sourcemap.concat(def ? 'export default module.exports;' : '');
    if (vars) {
        sourcemap.concat(`const {${vars}} = module.exports;`);
        sourcemap.concat(`export {${vars}};`);
    }

    return sourcemap;
}