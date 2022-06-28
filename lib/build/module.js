module.exports = function (code) {
    let output = '';

    output += 'const module = {};\n\n';
    output += 'const code = (module, require) => {\n';

    code = code.replace(/__toESM\(require\((.*)\), 1\);/g, (match, p1) => `__toESM(require(${p1}), 0);`);
    output += code + '\n';
    output += '};\n\n';

    output += 'code(module, require);\n';
    return output;
}
