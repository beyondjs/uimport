const fs = require('fs').promises;
const p = require('path');

// const bundle = 'svelte/internal';
// const bundle = 'svelte/store';
// const bundle = 'redux';
// const bundle = '@babel/runtime/helpers/esm/defineProperty';
const bundle = 'react-dom';
// const bundle = 'react';
// const bundle = 'swiper';
// const bundle = 'dom7';
// const bundle = 'ssr-window';
// const bundle = 'highlight-ts';
// const bundle = 'socket.io-client';
// const bundle = 'has-cors';
// const bundle = '@socket.io/component-emitter';
// const bundle = '@socket.io/base64-arraybuffer';
// const bundle = 'engine.io-parser';
// const bundle = 'yeast';
// const bundle = 'engine.io-client';

const application = {path: require('path').join(process.cwd(), '.temp')};

const paths = {
    inputs: p.join(__dirname, './.temp'),
    input: {relative: `input.js`},
    cache: p.join(__dirname, '.temp/output.js')
}
paths.input.fullpath = p.join(paths.inputs, paths.input.relative);
paths.input.dirname = p.dirname(paths.input.fullpath);

(async () => {
    const built = await require('./builder')(bundle, application, paths);
    if (built.errors?.length) {
        console.log('ERRORS FOUND:', built.errors);
        return;
    }

    await fs.writeFile(paths.cache, built.code, 'utf8');
    console.log(`Bundle "${bundle}" has been built`);
})().catch(exc => console.log(exc.stack));
