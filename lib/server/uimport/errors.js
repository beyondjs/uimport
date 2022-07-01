module.exports = function (resp, errors) {
    const message = `Errors found: ${errors}`;

    resp.writeHead(500, {
        'Content-Type': 'application/javascript',
        'Content_Length': message.length
    });
    resp.end();
}