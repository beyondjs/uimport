const packages = require('@beyond-js/uimport/packages-registry');

module.exports = async function (specifier, res) {
    const pkg = packages.get(specifier.pkg);
    await pkg.load();

    const output = Object.assign({uptodate: pkg.uptodate}, pkg.toJSON());
    return res.send(output).end();
}
