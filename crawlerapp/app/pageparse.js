var cheerio = require('cheerio');
var puppeteer = require('puppeteer');
var validUrl = require('valid-url');
var processUrl = require('url');
var request = require('request');
var mime = require('mime');
var robotsParser = require('robots-parser');
var bluebird = require('bluebird');

var bfsKeyword = false;
var bfsVisited = {};

module.exports = {

    searchHelper: async function(url, searchType, searchDepth, keyword) {
        process.setMaxListeners(Infinity);
        if (searchType == "dfs") {
            return this.crawlDepthFirstHelper(url, searchDepth, keyword);
        } else {
            return await this.crawlBreadthFirstHelper(url, searchDepth, keyword);
        }
    },
    crawlDepthFirstHelper: async function(url, searchDepth, keyword) {
        var data = await this.crawlDepthFirst(url, searchDepth, 0, keyword);
        console.log(data);
        return data;
    },
    crawlDepthFirst: function(url, searchDepth, currentDepth, keyword) {
        return puppeteer.launch({
            'args': ['--no-sandbox', '--disable-setuid-sandbox', "--proxy-server='direct://'", '--proxy-bypass-list=*', '--incognito'],
            timeout: 10000,
            ignoreHTTPSErrors: true,
            headless: true
        })
            .then(async browser => {
                var data = { nodes: [], links: [] };
                var page = await initBrowser(browser);
                await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36");
                var htmlObj = await navigateUrl(page, url);
                browser.close();    //close now to save memory
                
                var newDepth = currentDepth + 1;
                var crawlRes = {"url": url,
                        "depth": currentDepth};

                if (htmlObj[0].length == 0) {
                    //crawlRes.links = [];
                    //crawlRes.keywordFound = false;
                    data.nodes.push({id: url});
                    return data;
                }

                var urls = await parseHtml(htmlObj[0], htmlObj[1]);
                crawlRes.links = urls;

                var found = findKeyword(htmlObj[1], keyword);
                crawlRes.keywordFound = found;

                crawlRes.destinationState = htmlObj[2];

                var chosenUrl = await chooseRandomUrl(urls);

                //Add data for visualization
                //Use ES6 SET ?
                // console.log("Url: ", url);
                // data.nodes.push({id: url});

                if (currentDepth < searchDepth && found == false) {
                    data.nodes.push({id: url});
                    data.links.push({source: url, target: chosenUrl});
                    var res = await this.crawlDepthFirst(chosenUrl, searchDepth, newDepth, keyword);
                    data.nodes = [...new Set(data.nodes.concat(...res.nodes))];
                    data.links = [...new Set(data.links.concat(...res.links))];
                    return data;
                } else {
                    data.nodes.push({id: url});
                    data.links.push({source: url, target: chosenUrl});
                    return data;
                }
            })
            .catch(function(err) {
                console.log(err);
            });
    },
    crawlBreadthFirstHelper: async function(url, searchDepth, keyword) {
        bfsKeyword = false;
        bfsVisited = {};
        var data = await crawlBreadthFirst(url, searchDepth, 0, keyword);
        //console.log("HELPER");
        console.log(data);
        return data;
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
            return await page.goto(url, {/*waitUntil: 'networkidle'/*,*/ timeout: 5000}).then(async function() {
                //await page.waitForNavigation();

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

async function crawlBreadthFirst(url, searchDepth, currentDepth, keyword) {
    return await puppeteer.launch({
        'args': ['--no-sandbox', '--disable-setuid-sandbox', "--proxy-server='direct://'", '--proxy-bypass-list=*', '--incognito', '--deterministic-fetch'],
        timeout: 10000,
        ignoreHTTPSErrors: true,
        headless: true
    })
        .then(async browser => {
            var data = { nodes: [], links: [] };

            var newDepth = currentDepth + 1;
            var crawlRes = {"url": url,
                    "depth": currentDepth};

            if (bfsVisited[url] == true) {
                crawlRes.visited = true;
                browser.close();
                data.nodes.push({id: url});
                return data;
            } else {
                var page = await initBrowser(browser);
                await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36");
                var htmlObj = await navigateUrl(page, url)
                browser.close();    //close now to save memory

                if (htmlObj[0].length == 0) {
                    crawlRes.links = [];
                    crawlRes.keywordFound = false;
                    data.nodes.push({id: url});
                    return data;
                }

                var urls = await parseHtml(htmlObj[0], htmlObj[1]);
                crawlRes.links = urls;

                data.nodes.push({id: url});
                for (each in urls) {
                    data.links.push({source: url, target: urls[each]});
                } 

                var found = findKeyword(htmlObj[1], keyword);
                if (found) {
                    bfsKeyword = true;
                }
                crawlRes.keywordFound = found;

                crawlRes.destinationState = htmlObj[2];

                bfsVisited[url] = true;
                if (bfsKeyword == false && currentDepth < searchDepth && found == false) {
                    let batches = [];

                    while(crawlRes.links.length) {
                        batches.push(crawlRes.links.splice(0, 10));
                    }

                    for (each in batches) {
                        //console.log("EACH");
                        //console.log(batches[each]);

                        var toReturn = await Promise.all(batches[each].map(async function(link){
                            if (bfsVisited[link] == true) {
                                return data;
                            } else {
                                console.log("calling " + link);
                                return await crawlBreadthFirst(link, searchDepth, newDepth, keyword);
                            }
                        }))
                        .then(await function (data, res) {
                            for (each in res) {
                                data.nodes = [...new Set(data.nodes.concat(...res[each].nodes))];
                                data.links = [...new Set(data.links.concat(...res[each].links))];
                            }
                            return data;
                        }).catch(err => {
                            console.log(err);
                        });
                        //console.log(toReturn);
                        for (each in toReturn) {
                            data.nodes = [...new Set(data.nodes.concat(...toReturn[each].nodes))];
                            data.links = [...new Set(data.links.concat(...toReturn[each].links))];
                        }
                       
                    }
                    return data;
                } else {
                    return data;
                }
            }
        })
        .catch(function(err) {
            console.log(err);
        });
}