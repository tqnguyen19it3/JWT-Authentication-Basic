// CHILD ROUTE
const authRoute = require('./api/authRoute');


function initRoutes(app) {

    //SITE
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    //AUTH
    app.use('/api/v1/auth', authRoute);

}

module.exports = initRoutes
