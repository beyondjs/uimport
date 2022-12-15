const fetch = require('node-fetch');

const ERROR_CODES = Object.freeze({
    UNEXPECTED_ERROR: 0,
    INVALID_REGISTRY_RESPONSE: 1
});

module.exports = class {
    #packageName;
    get packageName() {
        return this.#packageName;
    }

    #found;
    get found() {
        return this.#found;
    }

    #data;
    get data() {
        return this.#data;
    }

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return this.#found && !this.#error;
    }

    constructor(packageName) {
        this.#packageName = packageName;
    }

    async fetch() {
        const response = await fetch(`https://registry.npmjs.org/${this.#packageName}`);

        const {ok, status} = response;
        if (status === 404) {
            this.#found = false;
            return;
        }

        this.#found = true;
        if (!ok) {
            const message = `Error fetching package from NPM repository with status: ${status}`;
            const code = ERROR_CODES.INVALID_REGISTRY_RESPONSE;
            this.#error = {code, message};
            return;
        }

        try {
            this.#data = await response.json();
        }
        catch (exc) {
            console.log(exc.stack);
            const {message} = exc;
            const code = ERROR_CODES.UNEXPECTED_ERROR;
            this.#error = {code, message};
        }
    }
}
