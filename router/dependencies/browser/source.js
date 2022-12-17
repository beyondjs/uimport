module.exports = `(() => {
const dependencies = new Map(/*dependencies*/);
System.constructor.prototype.resolve = (id, parent) => {
    let [resource, qs] = id.split('?');
    qs = qs ? \`?\${qs}\` : \'\';
    const split = resource.split('/');
    const pkg = split[0].startsWith(\'@\') ? \`\${split.shift()}/\${split.shift()}\` : split.shift();
    const subpath = split.length ? \`/\${split.join('/')}\` : '';

    if(!dependencies.has(pkg)) return id;
    const version = dependencies.get(pkg);
    return \`http://34.160.68.253/modules/\${pkg}@\${version}\${subpath}?format=sjs\`;
};
})()`.trim();