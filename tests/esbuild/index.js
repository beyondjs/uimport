const esbuild = require('esbuild');

(async () => {
	console.log(1, 'C:\\workspace\\ai\\agents\\platform\\client\\src\\.beyond\\uimport\\@firebase\\auth.1.10.0.js');
	console.log(2, 'C:\\workspace\\ai\\agents\\platform\\client\\src\\node_modules\\firebase\\');
	const { errors, warnings, metafile } = await esbuild.build({
		entryPoints: ['C:\\workspace\\ai\\agents\\platform\\client\\src\\.beyond\\uimport\\@firebase\\auth.1.10.0.js'],
		absWorkingDir: 'C:\\workspace\\ai\\agents\\platform\\client\\src\\node_modules\\firebase\\',
		logLevel: 'silent',
		bundle: true,
		metafile: true,
		platform: 'browser',
		format: 'esm',
		write: false,
		treeShaking: false
	});
})();
