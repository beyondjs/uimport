const http = require('http');
const {join} = require('path');
const fs = require('fs').promises;
require('colors');

module.exports = class {
    #port;
    #http;
    #cwd;

    #initialise = async () => {
        const exists = file => new Promise(r => fs.access(file)
            .then(() => r(true))
            .catch(() => r(false)));

        const cwd = this.#cwd;

        if (cwd && !(await exists(cwd))) {
            console.error(`Working directory path "${cwd}" does not exist.`.red);
            return;
        }

        if (cwd && !(await exists(join(cwd, 'node_modules')))) {
            console.error(`Working directory "${cwd}" does not have a node_modules folder.`.red);
            return;
        }

        const port = this.#port;

        const test = port => new Promise((resolve) => {
            const tester = require('net').createServer()
                .once('error', () => resolve(false))
                .once('listening', () => tester.once('close', () => resolve(true)).close())
                .listen(port);
        });
        if (!(await test(port))) {
            console.error(`Port "${port}" is already in use.`.red);
            return;
        }

        this.#http = http.createServer(require('./listener')(this.#cwd));
        this.#http.listen(port, null, error => error ?
            console.log(`Server couldn't be started: ${error.message}`) :
            console.log(`Server running in port: ${port}`)
        );
    }

    constructor(port, cwd) {
        const DEFAULT = 8080;

        port = isNaN(port) ? parseInt(port) : port;
        port = isNaN(port) ? DEFAULT : port;

        this.#port = port;
        this.#cwd = cwd;
        this.#initialise().catch(exc => console.log(exc.stack));
    }
}
