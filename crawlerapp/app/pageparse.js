var cheerio = require('cheerio');
var puppeteer = require('puppeteer');
var processUrl = require('url');
var request = require('request');

module.exports = {

    searchHelper: function(url, searchType, searchDepth, keyword) {
        if (searchType == "dfs") {
            return this.crawlDepthFirstHelper(url, searchDepth, keyword);
        } else {
            console.log("BFS NOT IMPLEMENTED!\n");
            return this.crawlBreadthFirstHelper(url, searchDepth, keyword);
        }

    },
    crawlDepthFirstHelper: async function(url, searchDepth, keyword) {
        var crawlRes = await this.crawlDepthFirst(url, searchDepth, 0, keyword);
        return crawlRes;
    },
    crawlDepthFirst: function(url, searchDepth, currentDepth, keyword) {
        return puppeteer.launch()
            .then(async browser => {
                var page = await initBrowser(browser);
                var html = await navigateUrl(page, url);
                browser.close();    //close now to save memory

                var newDepth = currentDepth + 1;
                var crawlRes = {"url": url,
                        "depth": currentDepth};

                var urls = parseHtml(url, html);
                crawlRes.links = urls;

                var found = await findKeyword(html, keyword);
                crawlRes.keywordFound = found;

                var chosenUrl = await chooseRandomUrl(urls);

                if (currentDepth < searchDepth && found == false) {
                    crawlRes.links[chosenUrl] = await this.crawlDepthFirst(chosenUrl, searchDepth, newDepth, keyword);
                    return crawlRes;
                } else {
                    return crawlRes;
                }
            })
            .catch(function(err) {
                console.log(err);
            });
    },
    crawlBreadthFirstHelper: function(url, searchDepth, keyword) {
        var crawlRes = this.crawlBreadthFirst(url, searchDepth, 0, keyword);
        return crawlRes;
    },
    crawlBreadthFirst: function(url, searchDepth, currentDepth, keyword) {
        // TODO
        var mock = {};
        mock.url = "NOT IMPLEMENTED";
        mock.depth = searchDepth;
        mock.links = {};
        mock.keyword = false;
        return mock;
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
            .close()
            .catch(function(err) {
                console.log(err);
            });
    }
};

function urlIsValid (testUrl) {
    try {
        new processUrl.URL(testUrl);

        // request(testUrl, (err, res) => {
        //     if (err) {
        //         console.log("INVALID URL: endpoint error\n"); 
        //         console.log(err); 
        //         return false; 
        //     }
        // });
        console.log("VALID URL\n"); 
        return true;
    } catch (err) {
        console.log(err)
        console.log("INVALID URL: format error\n"); 
        return false;
    }
};

function parseHtml (url, html) {
    try {
        //Iterate through each a tag
        var urlJson = {};
        cheerio('a', html).each(function() {
            //Get the href attribute of the a tag
            var nextUrl = cheerio(this).attr('href');
            //Prepend to relative path if protocol and domain info are missing
            var cleanUrl = new processUrl.URL(nextUrl, url).href;
            //Add to JSON object of URLs
            urlJson[cleanUrl] = false;
        });
        return urlJson;
    } catch (err) {
        console.log(err);
        return;
    }
}

function navigateUrl (page, url) {
    try {
        return page.goto(url).then(function() {
            //return page.content();
            return page.evaluate(() => document.body.innerHTML)
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

function chooseRandomUrl (urls) {
    try {
        //Choose a random Url from the deduplicated array
        var randNum = Math.random();
        var keys = Object.keys(urls);
        var nextUrl = keys[Math.floor(randNum * keys.length)];

        return nextUrl;
    } catch (err) {
        console.log(err);
        return;
    }
}

function findKeyword(html, keyword) {
    var found = false;
    var lKeyword = keyword.toLowerCase();
    (async () => {
        await cheerio(html).each(function() {
            if (cheerio(this).get(0).type == 'text') {
                if (cheerio(this).text().toLowerCase().includes(lKeyword)) {
                    found = true;
                }
            } else if (cheerio(this).get(0).type == 'tag' && cheerio(this).name != 'script') {
                if (cheerio(this).text().toLowerCase().includes(lKeyword)) {
                    found = true;
                }
            }
        });
    })();
    return found;
}