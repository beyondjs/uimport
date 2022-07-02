const fs = require('fs').promises;
const {join} = require('path');

let content;

module.exports = async function (resp) {
    const done = content => {
        resp.writeHead(200, {
            'Content-Type': 'text/html',
            'Content_Length': content.length
        });
        resp.end(content);
        return true;
    }

    if (content) return done(content);

    content = await (async () => {
        const resource = join(__dirname, './assets/index.html');
        return await fs.readFile(resource, 'utf8');
    })();

    return done(content);
}
