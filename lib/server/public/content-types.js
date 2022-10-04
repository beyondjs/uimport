const types = {
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.ico': 'image/ico',
    '.ttf': 'application/x-font-truetype',
    '.otf': 'application/x-font-opentype',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.eot': 'application/vnd.ms-fontobject',
    '.sfnt': 'application/font-sfnt',
    '.css': 'text/css',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.png': 'image/png',
    '.json': 'application/json',
    '.manifest': 'text/cache-manifest',
    '.webmanifest': 'application/manifest+json',
    '.ts': 'text/prs.typescript',
    '.d.ts': 'text/prs.typescript',
    '.map': 'application/json'
};

module.exports = function (extname) {
    return types.hasOwnProperty(extname) ? types[extname] : types['text/plain'];
};
