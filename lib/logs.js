const logs = {packages: false, dependencies: {files: true, bundles: false}};
// const logs = false;

module.exports = function (metafile) {
    if (!logs) return;

    const {packages, dependencies} = metafile;

    if (logs.packages) {
        console.log('Packages:', new Map([...packages].map(([location, pkg]) => [location, pkg.version])));
    }

    if (logs.dependencies.bundles) {
        console.log('Dependencies bundles size:', dependencies.bundles.size);
        console.log('Dependencies bundles:', dependencies.bundles);
    }

    if (logs.dependencies.files) {
        console.log('Dependencies files size:', dependencies.files.size);
        [...dependencies.files.keys()].forEach(im => {
            const d = dependencies.files.get(im);
            const consumers = [...d.values()].map(consumer => `${consumer.input} : ${consumer.pkg}`);
            console.log(im, consumers);
        });
    }
}
