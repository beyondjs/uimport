const Server = require('@beyond-js/uimport/server');

module.exports = {
    command: 'serve',
    description: 'Start local server',
    handler: async () => {
        const server = new Server();
        server.initialise();
    }
}
