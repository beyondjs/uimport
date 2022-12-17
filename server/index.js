const express = require('express');
const router = require('../router');

module.exports = class {
    #app;

    initialise(port) {
        const PORT = port || 8080;

        const app = this.#app = express();
        app.use(express.json());

        app.all('*', (req, res) => {
            router(req, res).catch(exc => {
                console.log(exc.stack);
                res.status(500).send(`Error: (500) - Error caught processing request: ${exc.message}`);
            });
        });

        app.listen(PORT, () => {
            console.log('Local repository port is:', PORT);
            console.log(`http://localhost:${PORT}`);
        });
    }
}
