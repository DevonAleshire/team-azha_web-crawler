// app/routes.js

module.exports = function(app) {
    app.get('*', function(req, res) {
        res.sendFile('./public/index.html'); // load our public/index.html file
    });
};