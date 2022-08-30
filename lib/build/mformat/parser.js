/**
 * Check if the dependencies are packaged with the version
 *
 * @param dependency {string} dependency name
 * @param versions {boolean} flag to add version
 * @return {string}
 */
module.exports = function (dependency, versions) {
    const regExp = /@(\d\.?)+/;
    return versions ? dependency : dependency.replace(regExp, '');
}