const packages = require('@beyond-js/uimport/packages-registry');

module.exports = async function (specifier, res) {
    const pkg = packages.get(specifier.pkg);
    await pkg.load();
    return res.send(pkg.toJSON()).end();
}
