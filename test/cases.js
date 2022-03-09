module.exports = new class extends Set {
    constructor() {
        super();

        this.add('react');
        this.add('react-dom');
        this.add('scheduler');
        this.add('svelte/internal');
        this.add('svelte/store');
        this.add('vue');
        this.add('redux');
        this.add('@babel/runtime/helpers/esm/defineProperty');
        this.add('swiper');
        this.add('dom7');
        this.add('ssr-window');
        this.add('highlight-ts');
        this.add('socket.io-client');
        this.add('has-cors');
        this.add('@socket.io/component-emitter');
        this.add('@socket.io/base64-arraybuffer');
        this.add('engine.io-parser');
        this.add('yeast');
        this.add('engine.io-client');
    }
}