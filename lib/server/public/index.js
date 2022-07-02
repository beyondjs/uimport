const fs = require('fs').promises;
const plain = ['text/html', 'text/plain', 'application/javascript', 'text/css', 'text/cache-manifest'];

module.exports = async function (url, resp) {
    if (url.pathname === '/') return await require('./readme.js')(resp);

    const resource = require('path').join(__dirname, `/assets${url.pathname}`);
    const exists = await new Promise(resolve => fs.access(resource)
        .then(() => resolve(true)).catch(() => resolve(false)));

    if (!exists) return false;

    try {
        const extname = require('path').extname(resource);
        const contentType = require('./content-types')(extname);
        if (plain.includes(contentType)) {
            const content = await fs.readFile(resource, 'utf8');
            resp.writeHead(200, {
                'Content-Type': contentType,
                'Content_Length': content.length
            });

            resp.end(content);
        }
        else {
            const content = await fs.readFile(resource);
            resp.writeHead(200, {
                'Content-Type': contentType,
                'Content_Length': content.length
            });

            resp.write(content, 'binary');
            resp.end();
        }
    }
    catch (exc) {
        console.log(exc.stack);
        resp.writeHead(404);
        resp.end(JSON.stringify(exc));
    }

    return true;
}
