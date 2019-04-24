// app/routes.js

module.exports = function (app) {
    app.get('*', function (req, res) {
        res.sendFile(__dirname, './public/index.html'); // load our public/index.html file
    });
};