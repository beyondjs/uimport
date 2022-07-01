const http = require('http');

module.exports = new class {
    #ports = {};
    #http;

    #initialise = async () => {
        const port = 8080;

        this.#http = http.createServer(require('./listener'));
        this.#http.listen(port, null, error => error ?
            console.log(`Server couldn't be started: ${error.message}`) :
            console.log(`Server running in port: ${port}`)
        );
    }

    constructor(ports) {
        this.#ports = ports;
        this.#initialise().catch(exc => console.log(exc.stack));
    }
}
