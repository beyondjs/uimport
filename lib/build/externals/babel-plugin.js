module.exports = ({dependencies: {bundles}}, versions) => () => ({
    visitor: {
        CallExpression({node}) {
            if (node.callee.name !== 'require') return;

            const required = node.arguments[0];
            if (!required.value) return;

            const value = required.value.slice(3); // remove the '../'
            if (!bundles.has(value)) return;

            const bundle = bundles.get(value);
            required.value = versions ? bundle.id : bundle.name;
        }
    }
});