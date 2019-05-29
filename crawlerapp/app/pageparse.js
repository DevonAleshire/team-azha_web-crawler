var cheerio = require('cheerio');
var puppeteer = require('puppeteer');
var validUrl = require('valid-url');
var processUrl = require('url');
var request = require('request');
var mime = require('mime');
var robotsParser = require('robots-parser');

var bfsKeyword = false;
var bfsVisited = {};
var data = { nodes: [], links: [] }

module.exports = {

    searchHelper: function(url, searchType, searchDepth, keyword) {
         data = { nodes: [], links: [] }
        if (searchType == "dfs") {
            return this.crawlDepthFirstHelper(url, searchDepth, keyword);
        } else {
            return this.crawlBreadthFirstHelper(url, searchDepth, keyword);
        }

    },
    crawlDepthFirstHelper: async function(url, searchDepth, keyword) {
        var crawlRes = await this.crawlDepthFirst(url, searchDepth, 0, keyword);
        //TODO: Update to use data structure
        return data;
    },
    crawlDepthFirst: function(url, searchDepth, currentDepth, keyword) {
        return puppeteer.launch({
            'args': ['--no-sandbox', '--disable-setuid-sandbox', "--proxy-server='direct://'", '--proxy-bypass-list=*'],
            timeout: 10000,
            ignoreHTTPSErrors: true,
            headless: true
        })
            .then(async browser => {
                var page = await initBrowser(browser);
                await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36");
                var htmlObj = await navigateUrl(page, url);
                browser.close();    //close now to save memory
                
                var newDepth = currentDepth + 1;
                var crawlRes = {"url": url,
                        "depth": currentDepth};
                            
                var urls = await parseHtml(htmlObj[0], htmlObj[1]);
                crawlRes.links = urls;

                var found = findKeyword(htmlObj[1], keyword);
                crawlRes.keywordFound = found;

                crawlRes.destinationState = htmlObj[2];

                var chosenUrl = await chooseRandomUrl(urls);
                
                //Add data for visualization
                //Use ES6 SET ?
                console.log("Url: ", url);
                data.nodes.push({id: url});
                
                if (currentDepth < searchDepth && found == false) {
                    console.log("Chosen Url: ", chosenUrl);
                    data.links.push({source: url, target: chosenUrl})
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

    crawlBreadthFirst: async function(url, searchDepth, currentDepth, keyword) {
        return await puppeteer.launch()
            .then(async browser => {
                //console.log(bfsVisited);
                var newDepth = currentDepth + 1;
                var crawlRes = {"url": url,
                        "depth": currentDepth};

                if (bfsVisited[url] == true) {
                    crawlRes.visited = true;
                    browser.close();
                    return crawlRes;
                } else {
                    var page = await initBrowser(browser);
                    var htmlObj = await navigateUrl(page, url)
                    browser.close();    //close now to save memory

                    var urls = await parseHtml(htmlObj[0], htmlObj[1]);
                    crawlRes.links = urls;

                    var found = findKeyword(htmlObj[1], keyword);
                    if (found) {
                        bfsKeyword = true;
                    }
                    crawlRes.keywordFound = found;

                    crawlRes.destinationState = htmlObj[2];

                    bfsVisited[url] = true;

                    if (bfsKeyword == false && currentDepth < searchDepth && found == false) {
                        for (var i = 0; i < crawlRes.links.length; i++) {
                            var nextUrl = crawlRes.links[i];
                            if (bfsVisited[nextUrl] == true) {
                                crawlRes.links[i] = {"url": nextUrl,
                                    "depth": newDepth,
                                    "visited": true};
                            } else {
                                console.log("calling!!!!");
                                console.log(crawlRes.links[i]);
                                crawlRes.links[i] = await this.crawlBreadthFirst(crawlRes.links[i], searchDepth, newDepth, keyword);
                            }
                        }
                        return crawlRes;
                    } else {
                        return crawlRes;
                    }
                }
            })
            .catch(function(err) {
                console.log(err);
            });
    },
    dataTransform: function() {

    },
    getPage: function (url) {
        return puppeteer.launch()
            .then(async browser => {

                var page = await initBrowser(browser);
                var html = await navigateUrl(page, url);
                browser.close();    //close now to save memory

                return html;
        })
        .catch(function(err) {
            console.log(err);
        });
    }
};

function urlIsValid (testUrl) {
    try {
        new processUrl.URL(testUrl);
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
        //Iterate through each <a> tag
        var urlList = [];
        cheerio('a', html).each(function() {
            //Get the href attribute of the <a> tag
            var nextUrl = cheerio(this).attr('href');
            var cleanUrl = false;
            
            //Some a tags do not have an href property and will resolve as undefined
            if (nextUrl != undefined) {
                //Prepend to relative path if protocol and domain info are missing
                cleanUrl = new processUrl.URL(nextUrl, url).href;
                
                var mimeType = mime.getType(cleanUrl);
                var isValid = validUrl.isWebUri(cleanUrl);

                //Check the mime type of the destination, only push html or potential html destinations
                //The isValid check will filter out mailto and script links
                if ((mimeType == 'text/html' || mimeType == null) && isValid == cleanUrl) {
                    urlList.push(cleanUrl);
                }
            }
        });
        return deDuplicateUrls(urlList);
    } catch (err) {
        console.log(err);
        return;
    }
}

async function navigateUrl (page, url) {
    try {
        var urlObj = new processUrl.URL(url);
        
        var robots = robotsParser(urlObj.origin + '/robots.txt', '*');
        var delayMs = robots.getCrawlDelay('*') == undefined ? 0 : robots.getCrawlDelay('*');
        var isAllowed = robots.isAllowed(url, '*');
        var htmlObj = [];

        if (!isAllowed) {       //Observe robots exclusion
            htmlObj.push(url);
            htmlObj.push([]);
            htmlObj.push('disallowed');
            return htmlObj;
        } else {
            await delay(delayMs);       //Observe robots crawl delay
            return await page.goto(url, timeout = 10000).then(function() {
                htmlObj.push(page.url());
                return page.evaluate(() => document.body.innerHTML).then(async function(res) {
                    var frames = page.frames();
                    for (frame in frames) {
                        var foo = await frames[frame].content();
                        res = res + foo;
                    }
                    htmlObj.push(res);
                    htmlObj.push('allowed');
                    return htmlObj;
                });
            }).catch((err) => {
                if (err.name == "TimeoutError") {
                    htmlObj.push([]);
                    htmlObj.push(err.name);
                    return htmlObj;
                } else {
                    htmlObj.push([]);
                    htmlObj.push('NavigationError');
                    return htmlObj;
                }
            });
        }
    } catch (err) {
        htmlObj.push([]);
        htmlObj.push('NavigationError');
        return htmlObj;
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
        //var keys = Object.keys(urls);
        var nextUrl = urls[Math.floor(randNum * urls.length)];

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

function getPage(url) {
    return puppeteer.launch()
        .then(async browser => {
            var page = await initBrowser(browser);
            var htmlObj = await navigateUrl(page, url);
            browser.close();    //close now to save memory

            return htmlObj;
    })
    .catch(function(err) {
        console.log(err);
    });
}

//https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line/51482993#51482993
const delay = ms => new Promise(res => setTimeout(res, ms));