// If there is no rewrite rule or the path does not match any rules,
// yug-server serves static files from the root without any rewrites

// If there are rules match the path, respond with the first succeed.
// If all are failed, respond with the last try.

var // fs = require('fs'),
  Path = require('path'),
  http = require('http'),
  mime = require('mime'),
  index = require('serve-index'),
//co = require('co'),
  fs = require('mz/fs'),
  send = require('koa-send');

module.exports = function () {
  return function *(next) {
    var config = this.request.config;
    if (config && config.hosts && config.hosts[this.request.host]) {
      yield process(this);
    }

    yield next;
  }
};

function process(ctx) {
  return function *() {
    var req = ctx.request,
      res = ctx.response,
      host = req.config.hosts[req.host] || {};

    host = cloneHost(host)

    var  rewrite = host.rewrite || [],
      len = rewrite.length,
      rule = {},
      tmpRule;

    rule.host = host.root
    rule.url = ctx.url
    rule.path = ctx.path
    /*console.log(ctx.url)*/
    var matched = false
    for (var i = 0; i != len; i++) {
      tmpRule = rewrite[i];
      if ('string' === typeof tmpRule.from)
        tmpRule.from = new RegExp(tmpRule.from)

      if (!tmpRule.test) {
        tmpRule.test = function (path) {
          return this.from && this.from.test(path);
        }
      }

      tmpRule.host = rule.host
      tmpRule.url = rule.url
      tmpRule.path = rule.path

      if (tmpRule.test(req.path)) {
        matched = true
      }
    }

    var succeed = false
    if (!matched) {
      // If there is no rewrite rule or the path does not match any rules,
      // yug-server serves static files from the root without any rewrites
      if (/^http(s)?:\/\//.test(rule.url)) {
        succeed = yield rewriteToUrl(ctx, rule)
      } else {
        succeed = yield rewriteToFs(ctx, rule)
      }
    } else {
      // If there are rules match the path, respond with the first succeed.
      // If all are failed, respond with the last try.

      // loop all the rewrite rules
      for (var i = 0; i != len; i++) {
        tmpRule = rewrite[i]
        if (tmpRule.test(req.path)) {
          if (yield tryRewrite(ctx, tmpRule)) {
            succeed = true
            break
          }
        }
      }
    }
    // if all rules failed
    if (!succeed) {
      ctx.res.statusCode = 404
      ctx.res.end();
    }

  };
}


function tryRewrite(ctx, rule) {
  return function *() {
    var req = ctx.request,
      res = ctx.response;

    var config = req.config,
      to = rule.to;

    if (typeof to === 'string') {
      to = to.replace(/\{([_a-zA-Z]\w*)\}/g, function (m, name) {
        return config[name] || m;
      });
    }

    //rule.path = rule.path.replace(rule.from, to)
    rule.url = rule.url.replace(rule.from, to)

    if ( /^http(s)?:\/\//.test(rule.url) ) {
      return yield rewriteToUrl(ctx, rule);
    } else {
      return yield rewriteToFs(ctx, rule);
    }
  }
}

function rewriteToUrl(ctx, rule) {
  var req = ctx.req,
    res = ctx.res;
  return function (next) {
    http.get(rule.url, function (r) {
      ctx.response.set({
        'content-type': r.headers['content-type'],
        'content-length': r.headers['content-length'],
        'file-path': r.headers['file-path'] ? rule.url + ' -> ' + r.headers['file-path'] : rule.url
      });

      if (404 === r.statusCode) {
        res.statusCode = 404;
        next(null, false);
        return;
      }

      if (302 === r.statusCode) {
        res.statusCode = 302;
        res.setHeader('location', r.headers.location);
        next(null, true);
      }

      r.on('data', function (data) {
        res.write(data)
        //data && ( body += data );
      });

      r.on('end', function (data) {
        res.end(data);
        //data && ( body += data );
        //ctx.body = 'x';
        next(null, true);
      });
    });
  }
}

function rewriteToFs(ctx, rule) {
  var req = ctx.request,
    res = ctx.response;

  return function *() {
    var path = Path.join(rule.host, rule.url);

    if (yield fs.exists(path)) {
      return yield doRewrToFs(path);
    } else {
      res.set({
        'File-Path': path
      });
      return false
    }

    function doRewrToFs(path) {
      return function *() {
        try {
          var stat = yield fs.stat(path);
          res.set({
            'content-type': mime.lookup(path),
            'file-path': path
          });

          if (stat.isFile()) {
            yield send(ctx, rule.url, {root: rule.host})
          } else if (stat.isDirectory()) {
            // these actions are to work around the limitation of 'serve-index'
            if ( '/' != ctx.req.url[ctx.req.url.length - 1] ) {
              ctx.res.statusCode = 302;
              ctx.res.setHeader('location', ctx.req.url + '/');
            } else {
              ctx.path = './'
              yield toDir(ctx, path)
            }
            /*yield toDir(ctx, rule.host)*/
          }
        } catch (err) {
          throw (err);
        }
        return true;
      };
    }

    function toDir(ctx, path) {
      return function (next) {
        index(path)(ctx.req, ctx.res, next);
      }
    }
  };
}

function cloneHost (host) {
  "use strict";
  var hostCp = {}

  if (host.root)
    hostCp.root = host.root

  if (host.rewrite) {
    hostCp.rewrite = []
    var len = host.rewrite.length;
    for (var i = 0; i != len; i++) {
      var temRew = host.rewrite[i]
      hostCp.rewrite.push({
        from: temRew.from,
        to: temRew.to
      })
    }
  }

  return hostCp
}