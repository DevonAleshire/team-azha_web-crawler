// app/routes.js
import searchHelper from './pageparse';

module.exports = function (router) {
    //Commented out for testing api route
    // app.get('*', function (req, res) {
    //     res.sendFile(__dirname, './public/index.html'); // load our public/index.html file
    // });

    router.route('/api/search').get(function (req, res) {
        console.log('Hello from the node server');  
        res.json({ response: "Response from server", isValid: true });
    });

    router.route('*').get(function (req, res) {
        res.sendfile('./public/index.html'); // load our public/index.html file
    });

};