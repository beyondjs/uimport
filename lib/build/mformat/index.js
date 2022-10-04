module.exports = function (mode, pkg, dependencies, exports, reexports, specs) {
    if (mode === 'esm') return require('./esm')(pkg, dependencies, specs, exports, reexports);
    if (mode === 'sjs') return require('./sjs')(pkg, dependencies, specs, exports, reexports);
    if (mode === 'amd') return require('./amd')(pkg, dependencies, specs, exports, reexports);
}