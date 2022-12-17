module.exports = async function (specifier, res) {
    await (specifier.version ? require('./vpackage')(specifier, res) : require('./package')(specifier, res));
}
