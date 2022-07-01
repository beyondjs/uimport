module.exports = function (url, resp) {
    const message = `404: Resource "${url.pathname}" not found`;
    resp.writeHead(404, {
        'Content-Type': 'text/plain',
        'Content_Length': message.length
    });

    resp.end(message);
}