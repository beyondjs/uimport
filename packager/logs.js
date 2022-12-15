const {logging} = require('#store');

module.exports = class {
    #id;
    #logging;

    constructor(vspecifier) {
        const {pkg, version} = vspecifier;
        this.#id = `modules-create-${pkg}-${version}`;
        this.#logging = logging.log(this.#id);
    }

    async add(text, severity) {
        severity = severity ? severity : 'INFO';
        const metadata = {severity};
        const entry = this.#logging.entry(metadata, text);
        console.log(text);
        await this.#logging.write(entry);
    }

    async get() {
        return await logging.getEntries({
            filter: `logName="projects/beyondjs-prod/logs/${this.#id}"`
        });
    }
}
