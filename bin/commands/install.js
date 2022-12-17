const Installer = require('@beyond-js/uimport/installer');

module.exports = {
    command: 'install',
    description: 'Installs the dependencies of the package',
    handler: async () => {
        console.log('install the dependencies');

        const installer = new Installer();
        await installer.process();
    }
}
