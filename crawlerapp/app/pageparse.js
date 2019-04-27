var cheerio = require('cheerio');
var puppeteer = require('puppeteer');
var processUrl = require('url');
const request = require('request');

module.exports = {

    searcHelper: function(url, searchType, searchDepth, keyword) {
        //TEST VARIABLES
        searchType = 1;
        searchDepth = 1;
        keyword = "";

        if (urlIsValid(url)) {
            //TODO: CALL APPROPRIATE CRAWL BASED ON TYPE
            getPage(url);
        } else {
            console.log("Invalid URL\n");
            return false;
        }
    },
    crawlDepthFirst: function() {

    },
    crawlBreadthFirst: function() {

    },
    collectUrls: function() {

    },
    findKeyword: function() {

    },
    selectRandomPage: function() {

    },
    dataTransform: function() {

    },
    getPage: function (url) {
        //TEST URL
        //const url = 'https://www.reddit.com';
        var urlArr = [];

        puppeteer
            .launch()
            .then(browser => initBrowser(browser))
            .then(page => navigateUrl(page, url))
            .then(html => parseHtml(html))
            .then(function() {
                console.log(urlArr);
            })
            .catch(function(err) {
                console.log(err);
            });
    }
};

function urlIsValid (testUrl) {
    try {
        new processUrl.URL(testUrl);

        request(testUrl, (err, res) => {
            if (err) {
                console.log("INVALID URL: endpoint error\n"); 
                console.log(err); 
                return false; 
            }
        });
        console.log("VALID URL\n"); 
        return true;
    } catch (err) {
        console.log(err)
        console.log("INVALID URL: format error\n"); 
        return false;
    }
};

function parseHtml (html) {
    try {
        cheerio('a', html).each(function() {
            urlArr.push(cheerio(this).attr('href'));
        });
    } catch (err) {
        console.log(err);
        return;
    }
}

function navigateUrl (page, url) {
    try {
        return page.goto(url).then(function() {
            return page.content();
        });
    } catch (err) {
        console.log(err);
        return;
    }
}

function initBrowser (browser) {
    try {
        return browser.newPage();
    } catch (err) {
        console.log(err);
        return;
    }
}