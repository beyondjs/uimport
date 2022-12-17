const tar = require('tar-stream');
const zlib = require('zlib');
const {sep, join} = require('path');
const {storage: {PackageFile}} = require('#store');

module.exports = function (root, done) {
    const files = [];

    const extract = tar.extract();
    extract.on('entry', function (header, reader, next) {
        const target = (() => {
            /**
             * Files are under the "package" folder, so remove it from its path
             */
            const split = header.name.split(sep);
            split[0] === 'package' && split.shift();
            const path = split.join('/');

            const {size, mtime, type} = header;
            files.push({path, size, mtime, type});
            return join(root, path);
        })();

        const file = new PackageFile(target);
        file.createWriteStream().then((writer) => {
            writer.on('error', error => done({error}));
            writer.on('finish', next);
            reader.pipe(writer);

            reader.resume();
        });
    });
    extract.on('finish', () => done({files}));

    const gunzip = zlib.createGunzip();
    gunzip.on('error', error => done({error}));
    return {gunzip, extract};
}
