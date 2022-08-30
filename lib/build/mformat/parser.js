const {sep} = require('path');

/**
 * Check if the dependencies are packaged with the version
 *
 * @param dependency {string} dependency name
 * @param specs {{versions?: boolean, prePath?: string}}
 * @return {string}
 */
module.exports = function (dependency, specs) {
    const {versions, prePath} = specs;

    let output = dependency;
    if (prePath) {
        const addSep = prePath[prePath.length - 1] !== '/';
        output = `${prePath}${addSep ? sep : ''}${dependency}`;
    }

    const regExp = /@(\d\.?)+/;
    output = versions ? output : output.replace(regExp, '');

    return output;
}