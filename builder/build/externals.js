const {parse} = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

/**
 * Transforms the esbuild imports to global imports
 * Ex: node_modules/svelte/internal/internal.js => svelte/internal
 */
module.exports = function (code, externals) {
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
            externals.has(required.value) && (required.value = externals.get(required.value).container);
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
