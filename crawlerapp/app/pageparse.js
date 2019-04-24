var cheerio = require('cheerio');
var puppeteer = require('puppeteer');
var processUrl = require('url');
const request = require('request');

var urlArr = [];

module.exports = {

    searcHelper: function() {

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
        
        if (validateUrl(url)) {
            console.log("IN IF\n");
            puppeteer
                .launch()
                .then(function(browser) {
                    return browser.newPage();
                })
                .then(function(page) {
                    return page.goto(url).then(function() {
                        return page.content();
                    });
                })
                .then(function(html) {
                    cheerio('a', html).each(function() {
                        urlArr.push(cheerio(this).attr('href'));
                    });
                })
                .then(function() {
                    console.log(urlArr);
                })
                .catch(function(err) {
                    console.log(err);
                });
        } else {
            console.log("Invalid URL\n");
            return false;
        }
        console.log(urlArr);
    }
};

function validateUrl (testUrl) {
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