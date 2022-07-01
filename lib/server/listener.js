module.exports = function (req, resp) {
    'use strict';

    const process = async function (url) {
        if (await require('./public')(url, resp)) return;
        if (await require('./uimport')(url, resp)) return;

        require('./404')(url, resp);
    }

    const url = require('url').parse(req.url);
    return process(url).catch(exc => console.log(exc.stack));
}
