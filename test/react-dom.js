const path = require('path');
const Builder = require('uimport/builder');

(async () => {
    // Create the client registry instance
    const specs = (() => {
        const specs = {};
        specs.registry = {cache: path.join(__dirname, './.uimport/registry')};
        specs.downloader = {cache: path.join(__dirname, './.uimport/downloads')};
        return specs;
    })();

    const builder = new Builder('react-dom', '18.2.0', specs);
    const {errors} = await builder.process();
    errors && console.log('Errors found', errors);
})().catch(exc => console.log(exc.stack));
