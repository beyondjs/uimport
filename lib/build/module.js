const SourceMap = require('./sourcemap');

module.exports = function ({code, map}) {
    const sourcemap = new SourceMap();

    sourcemap.concat('// Prevent esbuild from considering the context to be amd');
    sourcemap.concat('const define = void 0;');
    sourcemap.concat('const module = {};\n');
    sourcemap.concat('const code = (module, require) => {');

    code = code.replace(/__toESM\(require\((.*)\), 1\);/g, (match, p1) => `__toESM(require(${p1}), 0);`);
    sourcemap.concat(code, null, map);
    sourcemap.concat('};\n');

    sourcemap.concat('code(module, require);');
    return sourcemap;
}
