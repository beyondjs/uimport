# Universal Imports

> Convert NPM packages (ex: react, vue, d3, ...) into fresh ESM, locally!

Import them in any ESM environment (browser, Node.js v14+, Deno).

```javascript
// Consume react (as any other package) directlly from the browser and deno as ES module
import {useState} from 'react';
```

# How it works

```bash
npm install -g uimport
```

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
    cache?: string  // Bundles are saved in cache. Default: join(cwd, '.uimport/cache'); 
}
```

# Local server

# Features

# API

