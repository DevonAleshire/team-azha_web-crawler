var cheerio = require('cheerio');
var puppeteer = require('puppeteer');
var processUrl = require('url');
var request = require('request');

module.exports = {

    searchHelper: function(url, searchType, searchDepth, keyword) {
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
    findKeyword: function() {

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
            .then(html => parseHtml(url, html, urlArr))
            .then(function(newArr) {
                //console.log(newArr);
                var chosenUrl = chooseRandomUrl(newArr);
                console.log(chosenUrl);
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

function parseHtml (url, html, urlArr) {
    try {
        //Iterate through each a tag
        cheerio('a', html).each(function() {
            //Get the href attribute of the a tag
            var nextUrl = cheerio(this).attr('href');
            //Prepend to relative path if protocol and domain info are missing
            var cleanUrl = new processUrl.URL(nextUrl, url).href;
            //Push on to URL array
            urlArr.push(cleanUrl);
        });
        //Create a new array of unique URLs only and return
        return deDuplicateUrls(urlArr);
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

function deDuplicateUrls (urlArr) {
    try {
        //Create a new array of unique URLs only and return
        return [...new Set(urlArr)];
    } catch (err) {
        console.log(err);
        return;
    }
}

function chooseRandomUrl (urlArr) {
    try {
        //Choose a random Url from the deduplicated array
        var randNum = Math.random();

        var randChoice = Math.floor(randNum * urlArr.length);

        return urlArr[randChoice];
    } catch (err) {
        console.log(err);
        return;
    }
}