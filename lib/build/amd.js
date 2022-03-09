module.exports = function (code, externals) {
    const ids = [...externals.values()].map(im => im.external.id);

    const required = JSON.stringify(ids);
    const dependencies = new Map(ids.map((external, index) => [external, `dep_${index}`]));
    const params = [...dependencies.values()].join(', ');

    let output = '';
    output += `define(${required}, (${params}) => {\n`;

    // Create the map of dependencies
    output += (() => {
        if (!dependencies.size) return '';

        let script = '';
        const entries = [...dependencies.entries()].map(([dependency, param]) => `['${dependency}', ${param}]`);

        script += `const dependencies = new Map([${entries}]);`;
        return `${script}\n`;
    })();

    output += (() => dependencies.size ?
        'const require = dependency => dependencies.get(dependency);\n' :
        'const require = () => void 0;\n')();

    output += 'const module = {};\n\n';

    output += 'const code = (module, require) => {\n';
    output += code + '\n';
    output += '};\n\n';

    output += 'code(module, require);\n';
    output += 'return module.exports;\n';
    output += '});\n\n';

    return output;
}
