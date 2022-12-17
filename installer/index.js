const {join} = require('path');
const packages = require('@beyond-js/uimport/packages-registry');

module.exports = class {
    #cwd;

    constructor(cwd) {
        this.#cwd = cwd ? cwd : process.cwd();
    }

    async process() {
        let json;
        try {
            const path = join(this.#cwd, 'package.json');
            json = require(path);
        }
        catch (exc) {
            console.log(`Error reading package.json file: "${exc.message}"`);
            return;
        }

        console.log(json);
    }
}
