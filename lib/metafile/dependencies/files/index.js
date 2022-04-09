/**
 * Dependencies that are not in the exports of its package, and they are being consumed
 * directly from other bundles
 */
module.exports = class extends Map {
    constructor(ims, bundles) {
        super();

        ims.forEach(im => {
            if (bundles.has(im.input)) return;

            // Recursively find if the current input is being consumed from another package
            const recursive = ((consumers) => {
                consumers.forEach(consumer => {
                    if (consumer.pkg === im.pkg) return;

                    const consumers = this.has(im.input) ? this.get(im.input) : new Map();
                    consumers.set(consumer.input, consumer);
                    this.set(im.input, consumers);

                    recursive(consumer.consumers);
                });
            });

            recursive(im.consumers);
        });
    }
}
