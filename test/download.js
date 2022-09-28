const path = require('path');
const Registry = require('uimport/registry');
const Downloader = require('uimport/downloader');

(async () => {
    const registry = (() => {
        const cache = path.join(__dirname, './.uimport/registry');
        return new Registry({cache});
    })();

    const pkg = registry.obtain('react-dom');
    await pkg.fetch();
    const vpackage = pkg.version('18.2.0');

    const downloader = (() => {
        const cache = path.join(__dirname, './.uimport/downloads');
        return new Downloader(vpackage, {cache});
    })();

    await downloader.process();
    console.log('Package version downloaded');
})().catch(exc => console.log(exc.stack));
