/**
 * Created by Sandon on 2017/6/16.
 */
// If there is no rewrite rule or the path does not match any rules,
// yug-server serves static files from the root without any rewrites

// If there are rules match the path, respond with the first succeed.
// If all are failed, respond with a warning.

// If the rewritten path is a http url, the final rewritten url includes the query string.
// Otherwise the final rewritten url(file path) don't includes the query string

var // fs = require('fs'),
  Path = require('path'),
  http = require('http'),
  mime = require('mime'),
  index = require('serve-index'),
  url = require('url'),
  getRawBody = require('raw-body'),
  fs = require('mz/fs'),
  send = require('koa-send');

module.exports = async (ctx, next) => {
  var config = ctx.request.config
  if (config && config.hosts && config.hosts[ctx.request.host]) {
    await process(ctx)
  }
  
  await next()
}

async function process (ctx) {
  const req = ctx.request
  let host = req.config.hosts[req.host] || {}
  
  host = JSON.parse(JSON.stringify(host))
  
  let rewrite = host.rewrite || []
  let rule = {root: host.root}
  
  console.log(ctx.url, ctx.path)
  
  // If there are rules match the path, respond with the first succeed.
  // If all are failed, respond with a warning
  var matched = false
  const succeed = rewrite.find(async (tmpRule) => {
    if ('string' === typeof tmpRule.from)
      tmpRule.from = new RegExp(tmpRule.from)
    
    if (!tmpRule.test) {
      tmpRule.test = function (path) {
        return this.from && this.from.test(path)
      }
    }
    
    tmpRule.root = host.root
    
    if (tmpRule.test(req.path)) {
      matched = true
      if (await tryRewrite(ctx, tmpRule)) {
        return true
      }
    }
  })
  
  
  if (!matched) {
    // If there is no rewrite rule or the path does not match any rules,
    // yug-server serves static files from the root without any rewrites
    /*if (/^http(s)?:\/\//.test(rule.url)) {
      succeed = yield rewriteToUrl(ctx, rule)
    } else {
      succeed = yield rewriteToFs(ctx, rule)
    }*/
  } else if (!succeed) {
    // If all are failed, respond with a warning
    ctx.res.statusCode = 404
    ctx.res.end('all matched rules failed!')
  }
}


function tryRewrite(ctx, rule) {
  return function *() {
    var req = ctx.request
    
    var config = req.config,
      to = rule.to;
    
    rule.path = ctx.path.replace(rule.from, to)
    rule.url = ctx.url.replace(rule.from, to)
    
    if ( /^http(s)?:\/\//.test(rule.url) ) {
      return yield rewriteToUrl(ctx, rule);
    } else {
      return yield rewriteToFs(ctx, rule);
    }
  }
}

async function rewriteToUrl (ctx, rule) {
  var res = ctx.res
  
  var options = url.parse(rule.url)
  options.method = ctx.method
  options.headers = ctx.request.header
  //console.log(options)
  
  getRawBody(ctx.req, {
    length: ctx.length,
    //limit: '1mb',
    encoding: ctx.charset
  })
  .then(function (buf) {
    var req = http.request(options, function (r) {
      
      // bypass the response header
      var headers = {
        'file-path': r.headers['file-path'] ? rule.url + ' -> ' + r.headers['file-path'] : rule.url
      }
      for (var key in r.headers) {
        if (r.headers.hasOwnProperty(key))
          headers[key] = r.headers[key]
      }
      ctx.response.set(headers)
      
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
      
    req.on('error', (e) => {
      console.log(`problem with request: ${e.message}`);
      next(null, false);
    });
    
    // write data to request body
    req.write(buf);
    req.end();
  })
  .catch(function (err) {
    next(null, false);
  })
}

function rewriteToFs(ctx, rule) {
  var req = ctx.request,
    res = ctx.response;
  
  return function *() {
    var path = Path.join(rule.host, rule.path);
    
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
            yield send(ctx, rule.path, {root: rule.host})
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
