var cheerio = require('cheerio');
var validUrl = require('valid-url');
var processUrl = require('url');
var request = require('request');
var rp = require('request-promise-native');
var mime = require('mime');
var robotsParser = require('robots-parser');

module.exports = {

    searchHelper: async function (url, searchType, searchDepth, keyword) {
        process.setMaxListeners(Infinity);

        if (searchType == "dfs") {
            return this.crawlDepthFirstHelper(url, searchDepth, keyword);
        } else {
            return await this.crawlBreadthFirstHelper(url, searchDepth, keyword);
        }
    },
    crawlDepthFirstHelper: async function (url, searchDepth, keyword) {
        var data = await this.crawlDepthFirst(url, searchDepth, 0, keyword);
        console.log('***** DFS Completed *****')
        return data;
    },
    crawlDepthFirst: async function (url, searchDepth, currentDepth, keyword) {
        var urlStack = [];
        var nodeList = new Map();
        var visited = {};
        urlStack.push(new processUrl.URL(url).href);

        var found = false;
        var newDepth = currentDepth;

        var data = { nodes: [], links: [], keywordFound: false, keywordNode: "", searchNode: url };
        console.log("New Depth: ", newDepth, " - Search Depth: ", searchDepth)
        for (var i = 0; i < searchDepth; i++) {
            var nextUrl = urlStack.pop();
            var linkObj = {};
            if (newDepth > searchDepth || found == true) {
                break;
            } else {
                linkObj = { "url": nextUrl, "depth": newDepth };
                visited[nextUrl] = true;
            }

            var navObj = await getPage(linkObj, keyword)
                .then(await function (res) { return res; })
                .catch(err => {
                    console.log(err);
                });

            console.log(`Current Url: ${navObj.linkObj.url}\nCurrent Depth: ${newDepth}\n`)
            if (!nodeList.has(navObj.linkObj.url)) {
                nodeList.set(navObj.linkObj.url, newDepth);
            }

            found = navObj.found;

            if (found) {
                data.keywordFound = true;
                data.keywordNode = navObj.linkObj.url;
            }
            else {
                var randomUrl = await chooseRandomUrl(navObj.urls, visited);
                console.log(`Random Url: ${randomUrl}\n`)

                if (randomUrl == "") {
                    //No valid random URL found
                    break;
                } else {
                    urlStack.push(randomUrl);
                    newDepth = newDepth + 1;
                }

                if (!nodeList.has(randomUrl)) {
                    nodeList.set(randomUrl, newDepth);
                    data.links.push({ source: navObj.linkObj.url, target: randomUrl });
                }
            }



        }

        for (var [k, v] of nodeList) {
            data.nodes.push({ id: k, depth: v });
        }

        return data;
    },
    crawlBreadthFirstHelper: async function (url, searchDepth, keyword) {
        bfsKeyword = false;
        bfsVisited = {};
        var data = await crawlBreadthFirst(url, searchDepth, 0, keyword);
        console.log('***** BFS Completed *****')
        return data;
    }
};

function parseHtml(url, html) {
    try {
        //Iterate through each <a> tag
        var urlList = [];
        cheerio('a', html).each(function () {
            //Get the href attribute of the <a> tag
            var nextUrl = cheerio(this).attr('href');
            var cleanUrl = false;

            //Some a tags do not have an href property and will resolve as undefined
            if (nextUrl != undefined) {
                //Prepend to relative path if protocol and domain info are missing
                var isValid = false;
                try {
                    cleanUrl = new processUrl.URL(nextUrl, url).href;
                    isValid = validUrl.isWebUri(cleanUrl);
                } catch (err) {
                    isValid = false;
                }

                var mimeType = mime.getType(cleanUrl);

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

async function navigateUrl(url) {
    try {
        var urlObj = new processUrl.URL(url);

        var robots = robotsParser(urlObj.origin + '/robots.txt', '*');
        var delayMs = robots.getCrawlDelay('*') == undefined ? 0 : robots.getCrawlDelay('*');
        var isAllowed = robots.isAllowed(url, '*');
        var htmlObj = {};
        htmlObj["url"] = url;
        htmlObj["html"] = "";

        if (!isAllowed) {       //Observe robots exclusion
            htmlObj["status"] = "disallowed";
            return htmlObj;
        } else {
            var headerOptions = {
                uri: urlObj
                , 'headers': {
                    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
                }
                , 'timeout': 3000
            };
            var isHtml = await rp.head(headerOptions)
                .then(async function (res) {
                    return res['content-type'].includes('text/html');
                }).catch((err) => {
                    //console.log(err);
                    //console.log(urlObj + " - FAILED GET HEAD");
                    return false;
                });
            if (isHtml) {
                var options = {
                    uri: urlObj
                    , 'headers': {
                        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
                    }
                    , 'timeout': 5000
                };
                await delay(delayMs);       //Observe robots crawl delay
                return await rp(options).then(async function (htmlString) {
                    htmlObj["html"] = htmlString;
                    htmlObj["status"] = "allowed";
                    //console.log("SIZE " + JSON.stringify(htmlObj).length + url);
                    return htmlObj;
                }).catch((err) => {
                    if (err.name == "TimeoutError") {
                        htmlObj["status"] = err.name;
                        return htmlObj;
                    } else {
                        htmlObj["status"] = "NavigationError";
                        return htmlObj;
                    }
                });
            } else {
                htmlObj["status"] = "NavigationError";
                return htmlObj;
            }
        }
    } catch (err) {
        //console.log(err);
        htmlObj["status"] = "NavigationError";
        return htmlObj;
    }
}

function deDuplicateUrls(urlArr) {
    try {
        //Create a new array of unique URLs only and return
        return [...new Set(urlArr)];
    } catch (err) {
        console.log(err);
        return;
    }
}

async function chooseRandomUrl(urls, visited) {
    try {
        var randomUrl = "";

        //If there are no URLS return an empty string
        if (urls.length == 0) { return randomUrl };

        var chosen = false;
        var tryCount = 0;
        while (!chosen && tryCount < 5) {
            tryCount = tryCount + 1;    //Prevent an infinite loop, only try to find unique URL 5 times

            //Choose a random Url from the deduplicated array
            var randNum = Math.random();
            var nextUrl = urls[Math.floor(randNum * urls.length)];

            //Don't get the body, just the header and test it for text/html
            var options = {
                uri: nextUrl
                , 'headers': {
                    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
                }
                , 'timeout': 7500
            };
            var isHtml = await rp.head(options)
                .then(async function (res) {
                    return res['content-type'].includes('text/html');
                }).catch((err) => {
                    //console.log(err);
                    //console.log(nextUrl + " - FAILED GET HEAD");
                    return false;
                });

            if (visited[nextUrl] == undefined && isHtml) {
                chosen = true;
                randomUrl = nextUrl;
            }
        }
        return randomUrl;
    } catch (err) {
        console.log(err);
        return "";
    }
}

function findKeyword(html, keyword) {
    var found = false;
    var lKeyword = keyword.toLowerCase();
    (async () => {
        await cheerio(html).each(function () {
            if (cheerio(this).get(0).type == 'text') {
                if (cheerio(this).text().toLowerCase().includes(lKeyword)) {
                    found = true;
                    console.log('Search for keyword: ', keyword, ' - ', linkObj.url, ' was found: ', toReturn.found)
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

async function getPage(linkObj, keyword) {
    var htmlObj = await navigateUrl(linkObj.url);
    var toReturn = { found: false };

    toReturn.urls = await parseHtml(htmlObj.url, htmlObj.html);

    if (keyword) {
        toReturn.found = findKeyword(htmlObj.html, keyword);
        if (toReturn.found) { console.log('Search for keyword: ', keyword, ' at -> ', linkObj.url, ' was found: ', toReturn.found) }
    }

    toReturn.linkObj = linkObj;

    return toReturn;
}

//Ref: https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line/51482993#51482993
const delay = ms => new Promise(res => setTimeout(res, ms));

async function crawlBreadthFirst(url, searchDepth, currentDepth, keyword) {
    var urlQueue = [];
    var depthQueue = [];
    var nodeList = new Map();
    var visited = {};

    urlQueue.push(new processUrl.URL(url).href);
    depthQueue.push(currentDepth);

    var found = false;
    var newDepth = currentDepth;
    var depthHit = false;
    var queueLim = 3;

    var data = { nodes: [], links: [], keywordFound: false, keywordNode: "" };

    while (urlQueue.length > 0 && found == false && depthHit == false) {
        var batch = [];
        for (var i = 0; i < Math.min(queueLim, urlQueue.length); i++) {
            newDepth = depthQueue.shift();
            newUrl = urlQueue.shift();

            if (newDepth > searchDepth) {
                depthHit = true;
            } else {
                batch.push({ "url": newUrl, "depth": newDepth });  //linkObj
                if (!nodeList.has(newUrl)) {
                    nodeList.set(newUrl, newDepth)
                }
                visited[newUrl] = true;
            }
        }

        if(newDepth <= searchDepth){
            var batchRes = await Promise.all(batch.map(async function (linkObj) {
                return await getPage(linkObj, keyword);
            }))
                .then(await function (res) { return res; })
                .catch(err => {
                    console.log(err);
                });
        }
        
        for (each in batchRes) {
            var navObj = batchRes[each];
            for (url in navObj.urls) {
                var nextUrl = navObj.urls[url];
                if (visited[nextUrl] == undefined) {
                    urlQueue.push(nextUrl);
                    depthQueue.push(navObj.linkObj.depth + 1);
                }

                if ((navObj.linkObj.depth + 1 <= searchDepth) && !nodeList.has(nextUrl)) {
                    nodeList.set(nextUrl, navObj.linkObj.depth + 1);
                    data.links.push({ source: navObj.linkObj.url, target: nextUrl });
                    console.log(`Adding new link ->\nSource: ${navObj.linkObj.url}\nTarget: ${nextUrl}\n`)
                }
            }
            if (navObj.found == true) {
                data.keywordFound = true;
                data.keywordNode = navObj.linkObj.url;
                found = true;
            }
        }
    }

    for (var [k, v] of nodeList) {
        data.nodes.push({ id: k, depth: v });
    }

    return data;
}