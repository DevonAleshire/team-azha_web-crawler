
module.exports = function (router) {

    const searchFunctions = require('./pageparse')
    //Commented out for testing api route
    // app.get('*', function (req, res) {
    //     res.sendFile(__dirname, './public/index.html'); // load our public/index.html file
    // });

    router.route('/api/search').get(function (req, res) {
        console.log('Search Request Received');  

        return searchFunctions.searchHelper(req.query.url, req.query.searchMethod, req.query.depth, req.query.keyword)
            .then(r => res.json(r));
    });

    router.route('*').get(function (req, res) {
        res.sendfile('./public/index.html'); // load our public/index.html file
    });

};