const register = require('./register');
const get = require('./get');
const browser = require('./browser');

module.exports = async function (pathname, req, res) {
    const split = pathname.split('/');
    if (!split.length || !['register', 'get', 'browser'].includes(split[0])) {
        res.status(404).send('Error: (404) - Invalid URL: action "register" or "get" must be specified').end();
        return;
    }

    const vdir = split.shift();
    if (split.length > 2) {
        res.status(404).send('Error: (404) - Invalid URL, just specify customer id and application id').end();
        return;
    }
    if (split.length !== 2) {
        res.status(404).send('Error: (404) - Invalid URL, customer id and application id must be specified').end();
        return;
    }

    const customer = split.shift();
    const application = split.shift();
    const id = `${customer}/${application}`;

    if (vdir === 'register') {
        await register(id, req, res);
    }
    else if (vdir === 'get') {
        await get(id, res);
    }
    else if (vdir === 'browser') {
        await browser(id, res);
    }
}
