const SourceMap = require('./sourcemap');
const {sep} = require('path');
const resolveRequireCalls = require('./require-calls');

module.exports = function (externals, outputs) {
    const code = outputs?.find(({path}) => path.endsWith(`${sep}out.js`))?.text;
    const map = outputs?.find(({path}) => path.endsWith(`${sep}out.js.map`))?.text;

    const requires = resolveRequireCalls(externals);

    const sourcemap = new SourceMap();
    requires && sourcemap.concat(requires.imports);
    requires && sourcemap.concat(requires.resolver);

    /**
     * Wrap the code
     */
    const solved = code.replace(/__toESM\(require\((.*)\), 1\);/g, (match, p1) => `__toESM(require(${p1}), 0);`);
    sourcemap.concat('const module = {};\n');
    sourcemap.concat('const code = (module) => {');
    sourcemap.concat(solved, null, map);
    sourcemap.concat('};\n');
    sourcemap.concat('code(module);');

    /**
     * The exports
     */
    const {exports} = require('cjs-module-lexer').parse(code);
    const named = new Set(exports);
    const def = named.has('default');
    named.delete('default');
    named.delete('__esModule');
    const vars = [...named].join(',');

    /**
     * The default export
     */
    sourcemap.concat(def ?
        'export default module.exports.default;' : 'export default module.exports;');

    /**
     * The namespace export
     */
    if (vars) {
        sourcemap.concat(`const {${vars}} = module.exports;`);
        sourcemap.concat(`export {${vars}};`);
    }

    return sourcemap;
}
