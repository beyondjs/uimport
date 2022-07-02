const uimport = require('uimport');
require('colors');

module.exports = async function (url, cwd, resp) {
    let {pathname} = url;
    const mode = pathname.endsWith('/+amd') ? 'amd' : 'esm';
    pathname = mode === 'amd' ? pathname.slice(0, pathname.length - '/+amd'.length) : pathname;

    const extname = require('path').extname(pathname);
    if (extname !== '.js') return;

    let errors, code;
    try {
        const bundle = pathname.slice(1, pathname.length - 3);
        ({errors, code} = await uimport(bundle, mode, {cwd}));
    }
    catch (exc) {
        const error = 'Oops! An unexpected error was found:';
        console.log((error).red.bold);
        console.log(exc.stack);
        require('./errors')(resp, `${error}: ${exc.stack}`);
        return true;
    }

    if (errors?.length) {
        require('./errors')(resp, errors);
        return true;
    }

    resp.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Content_Length': code.length
    });
    resp.end(code);

    return true;
}
