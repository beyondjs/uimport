const express = require('express');
const {Route, router} = require('@beyond-js/router');

module.exports = class {
    #app;

    initialise(port) {
        const PORT = port || 8080;

        const app = this.#app = express();
        app.use(express.json());

        app.all('*', (req, res) => {
            const route = new Route(req);
            if (route.error) {
                res.status(404).send(`Error: (404) - ${route.error}`).end();
                return;
            }

            router(route, res).catch(exc => {
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
