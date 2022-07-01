const uimport = require('uimport');

module.exports = async function (url, resp) {
    let {pathname} = url;
    const mode = pathname.endsWith('/+amd') ? 'amd' : 'esm';
    pathname = mode === 'amd' ? pathname.slice(0, pathname.length - '/+amd'.length) : pathname;

    const extname = require('path').extname(pathname);
    if (extname !== '.js') return;

    const bundle = pathname.slice(1, pathname.length - 3);
    const {errors, code} = await uimport(bundle, mode);

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
