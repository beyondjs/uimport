/**
 * Check if the dependencies are packaged with the version
 *
 * @param mode {string} packaging mode
 * @param metafile {{bundle:string, version: string}} metafile package
 * @param dependencies {object} The bundle dependencies
 * @param specs {{versions?: boolean, prePath?: string}}
 * @return {string}
 */
module.exports = function (mode, {bundle, version}, dependencies, specs) {
    const {versions, prePath} = specs;
    if (!!versions === false && !!prePath === false) return '';
    if (bundle.startsWith('http')) {
        return `${mode === 'sjs' ? 'System.import' : 'import'}(${bundle});`;
    }

    const deps = [...dependencies.keys()].map(dependency => {
        const split = dependency.split('/');
        const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();

        let specifier, version;
        if (!pkg.startsWith('@')) [specifier, version] = pkg.split('@');
        else {
            [, specifier, version] = pkg.split('@');
            specifier = `@${specifier}`;
        }

        return [specifier, version];
    });
    const pPath = !prePath ? '' : !prePath.endsWith('/') ? `, ${prePath}/` : `, ${prePath}`;

    let output = `\nconst bimport = specifier => {\n`
    output += `\tconst dependencies = new Map(${JSON.stringify(deps)});\n`
    output += `\tglobalThis.bimport(globalThis.bimport.resolve(specifier, dependencies${pPath}));\n`;
    output += `};\n`;

    return output;
}