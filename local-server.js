const express = require('express');
const app = express();
const router = require('./router');

const PORT = process.env.PORT || 8080;

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
