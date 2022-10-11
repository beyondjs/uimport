const path = require('path');
const Builder = require('uimport/builder');

(async () => {
    // Create the client registry instance
    const specs = (() => {
        const specs = {};
        specs.registry = {cache: path.join(__dirname, './.uimport/registry')};
        specs.downloader = {cache: path.join(__dirname, './.uimport/downloads')};
        specs.builds = {cache: path.join(__dirname, './.uimport/builds')};
        return specs;
    })();

    const rq = {pkg: 'react-dom', version: '18.2.0', subpath: '.'}
    const vspecifier = `${rq.pkg}@${rq.version}` + (rq.subpath === '.' ? '' : `/${rq.subpath}`);

    console.log(`Building package "${vspecifier}" ...`);
    const builder = new Builder(rq.pkg, rq.version, rq.subpath, specs);
    await builder.process();
    console.log(`Package "${vspecifier}" has been built`);
})().catch(exc => console.log(exc.stack));
