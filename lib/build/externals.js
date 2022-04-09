const {parse} = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

/**
 * Transforms the esbuild imports to global imports
 * Ex: node_modules/svelte/internal/internal.js => svelte/internal
 */
module.exports = function (code, metafile) {
    const {bundles} = metafile.dependencies;

    let ast;
    try {
        ast = parse(code);
    }
    catch (exc) {
        return {errors: [exc.message]};
    }

    const errors = [];
    traverse(ast, {
        CallExpression({node}) {
            if (node.callee.name !== 'require') return;
            const required = node.arguments[0];
            if (!required.value) return;

            const value = required.value.slice(2); // remove the './'
            if (bundles.has(value)) {
                const bundle = bundles.get(value);
                required.value = bundle.id;
            }
        }
    });

    try {
        code = generate(ast, code).code;
    }
    catch (exc) {
        return {errors: [exc.message]};
    }

    return errors.length ? {errors} : {code};
}
