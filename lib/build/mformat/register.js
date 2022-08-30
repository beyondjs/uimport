/**
 * Check if the dependencies are packaged with the version
 *
 * @param mode {string} packaging mode
 * @param metafile {{bundle:string, version: string}} metafile package
 * @return {string}
 */
module.exports = function (mode, {bundle, version}) {
    const texts = mode === 'sjs' ? 'system.import' : 'import';

    let output = `const dependencies = new Map([['${bundle}', '${version}']]);\n`;
    output += `const uimport = module => ${texts}(globalThis.uimport.resolve(module, dependencies));\n\n`;

    return output;
}