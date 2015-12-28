var util = require('util'),
    fs = require('fs'),
    Path = require('path'),
    http = require('http'),
    mime = require('mime'),
    index = require('serve-index'),
    serveFile = require('koa-static');

module.exports = function () {
    return function *(next) {
        var config = this.request.config;
        if ( config && config.hosts && config.hosts[this.request.host] ) {
            console.log(this.request.url)
            yield process( this );
        }

        yield next;
    }
};

function process(ctx) {
    var req = ctx.request,
        res = ctx.response,
        host = req.config.hosts[req.host],
        rewrite = host.rewrite || [],
        len = rewrite.length;
    var toFsPromise;

    if ( 0 == len ) {
        var rule = {};
        rule.host = host.root;
        rule.url = ctx.request.url;

        if ( /^http(s)?:\/\//.test(rule.url) ) {
            //return yield rewriteToUrl(req, res, rule);
        } else {
            toFsPromise = rewriteToFs(ctx, rule);
        }
        return toFsPromise;
    } else {
        return new Promise(function (resolve, reject) {
            var i = 0, rwtPromise;
            var checkNextRule = function () {
                if ( i >= len ) {
                    reject();
                    return;
                }

                var rule = utils.extend({}, rewrite[i]),
                    from = rule.from;

                from = typeof from === 'string' ? new RegExp(from) : from;
                rule.from = from;
                rule.test = rule.test || function (req) {
                    return from && from.test(req.url);
                };

                if (rule.test(req)) {
                    rule.url = req.url.replace(rule.from, rule.to);
                    //util.debug('rewrite to: ' + rule.url);

                    if (/^http(s)?:\/\//.test(rule.url)) {
                        rwtPromise = rewriteToUrl(ctx, rule);
                    } else {
                        rwtPromise = rewriteToFs(ctx, rule);
                    }

                    rwtPromise.then(function (value) {
                        resolve();
                    }, function (value) {
                        i++;
                        checkNextRule();
                    });
                }

                i++;
                checkNextRule();
            };
            checkNextRule();
        });
    }
}



function rewriteToUrl(ctx, rule) {
    var req = ctx.request,
        res = ctx.response;
    return new Promise(function (resolve, reject) {
        http.get(rule.url, function(r) {
            if (r.statusCode === 404) {
                reject();
            }

            if (r.statusCode === 302) {
                res.statusCode = 302;
                res.setHeader('location', r.headers.location);
                res.end();
            }
            r.on('data', function(data) {
                res.write(data)
            });

            r.on('end', function(data) {
                res.end(data);
                resolve();
            });
        });
    });
}

function rewriteToFs(ctx, rule) {
    var req = ctx.request,
        res = ctx.response;

    return new Promise(function (resolve, reject) {
        var path = rule.host +  rule.url;
        path = path.replace(/\?.*$/, '');

        var newPath	= Path.join(req.config.root || '', path);
        fs.exists(newPath, function(exists) {
            if ( !exists ) {
                fs.exists(path, function(exists) {
                    if ( !exists )
                        reject()
                    else
                        doRewrToFs( path )
                });
            } else {
                doRewrToFs( newPath )
            }
        });

        function doRewrToFs ( path ) {
            fs.stat(path, function (err, stat) {
                if (err) {
                    reject(err);
                    return;
                }

                res.set({
                    'Content-Type': mime.lookup(path),
                    'File-Path': path
                });
                console.log(path)

                if (stat.isFile()) {
                    console.log('file');
                    function * wrapGen() {
                        var rst = yield serveFile( Path.dirname(path) )

                    }

                } else if (stat.isDirectory()) {
                    console.log('dir')
                    index( rule.host )( ctx.req, ctx.res, resolve );
                } else {
                    reject(new Error('invalid file:' + path));
                }
            });
        }
    });
}

