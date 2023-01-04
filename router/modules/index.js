const js = require('./js');
const css = require('./css');
const logs = require('./logs');

module.exports = async function (specifier, options, res) {
    res.set('Access-Control-Allow-Origin', '*');

    if (!specifier.version) {
        res.status(404).send('Error: (404) - Package version must be set').end();
        return;
    }

    if (options.logs) return await logs(specifier, options, res);
    else if (options.css) return await css(specifier, options, res);
    else return await js(specifier, options, res);
}
