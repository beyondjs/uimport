const fs = require('fs');

module.exports = function plugin(wrapper, cwd) {
	return {
		name: 'uimport-entry-plugin',
		setup(build) {
			// Redirige cualquier entry point a un módulo virtual
			build.onResolve({ filter: /.*/ }, args => {
				if (args.kind === 'entry-point') {
					return { path: `${cwd}/virtual-entry.js` };
				}
			});

			// Devuelve el contenido deseado para ese módulo virtual
			build.onLoad({ filter: /virtual-entry\.js$/ }, args => {
				const contents = fs.readFileSync(wrapper, 'utf-8');
				return { contents, loader: 'js' };
			});
		}
	};
};
