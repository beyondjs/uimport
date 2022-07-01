# Universal Imports

> Convert NPM packages (ex: react, vue, d3, ...) into fresh ESM, locally!

Import them in any ESM environment (browser, Node.js v14+, Deno).

```javascript
// Consume react (as any other package) directlly from the browser and deno as ES modules.
import {useState} from 'react';
```

# How it works

```bash
npm install -g uimport
```

## Local server

You can consume the bundles through a local server by running:

```bash
uimport server --port=8080 --cwd=working_directory
```

![Deno consuming react as a local package](./readme/deno.png "Deno consuming react as a local package").

## API

UImport will look into the node_modules folder to find the package to be bundled. You can optionally specify the current
working directory where node_modules resides.

```javascript
const uimport = require('uimport');
const bundle = 'react';
const {code, errors, warnings, dependencies} = await uimport(bundle);
```

```javascript
// mode can be 'esm' or 'amd'
const {code, errors, warnings, dependencies} = await uimport(bundle, mode, specs);
```

* specs:

```typescript
interface specs {
    cwd?: string,   // The working directory where the local NPM modules are installed
    temp?: string,  // A required folder to save temporary files. Default: join(cwd, '.uimport/temp')
    cache?: string, // Bundles are saved in cache. Default: join(cwd, '.uimport/cache');
    dependencies?: boolean // Build the dependencies of the bundle
}
```

```typescript
interface output {
    code: string,
    errors?: string[],
    warnings?: string[],
    dependencies?: string[]
}
```
