const index = require('uimport');
const {join} = require('path');

module.exports = async function (url, resp) {
    const {pathname} = url;
    const extname = require('path').extname(pathname);
    if (extname !== '.js') return;

    const cwd = process.cwd();
    const paths = {
        cwd: cwd, // The working directory
        temp: join(cwd, '.uimport/temp'),
        cache: join(cwd, '.uimport/cache')
    };
    const mode = 'esm';

    const bundle = pathname.slice(1, pathname.length - 3);
    const {errors, code} = await index(bundle, mode, paths);

    if (errors?.length) {
        require('./errors')(resp, errors);
        return;
    }

    resp.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Content_Length': code.length
    });
    resp.end(code);

    return true;
}
