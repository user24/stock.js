/*jslint node:true*/
"use strict";

var http = require('http');
var fs = require('fs');
var url = require('url');

var num = process.argv[3] || 50;
var keyword = process.argv[2];
var i = 1;

var rateLimitMS = 500;

function saveFile(src, file_name) {
    var options, file, req;
    
    if (!file_name) {
        file_name = url.parse(src).pathname.split('/').pop();
    }

    console.log("downloading " + src + " to " + file_name);
    
    file = fs.createWriteStream("./downloads/" + file_name);

    options = {
        host: url.parse(src).host,
        port: 80,
        path: url.parse(src).pathname
    };
    
    http.get(options, function (res) {
        res.on('data', function (chunk) {
            file.write(chunk);
        }).on('end', function () {
            file.end();
        });
    });
}

if (process.argv.length < 3) {
    console.log("Stock.js: https://github.com/user24/stock.js");
    console.log("Downloads images from jpg.to");
    console.log("Usage: " + process.argv[0] + " " + url.parse(process.argv[1]).pathname.split('/').pop() + " keyword [num=50]");
    process.exit();
}

var options = {
    "port": 80,
    "path": '/s+r+jpg?' + Math.random(),
    "method": 'GET'
};

options.hostname = process.argv[2] + ".jpg.to";

console.log("Fetching " + num + " '" + process.argv[2] + "' images.");

function fetchAnother() {
    var req = http.request(options, function (res) {
        var html = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            html += chunk;
        });
        res.on('end', function () {
            var src = html.substring(html.indexOf(' src="') + 6, html.indexOf('" />'));
            saveFile(src, keyword + i + ".jpg");
            i += 1;
            if (i <= num) {
                setTimeout(fetchAnother, rateLimitMS);
            } else {
                console.log("done");
            }
        });
    });
    
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    
    req.end();
}
fetchAnother();