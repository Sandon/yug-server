/**
 * 一些工具方法
 */

var util = require('util');

/**
 * 扩展对象
 */
exports.extend = function(des /*, src1, src2, ... */) {
    var objs = [].slice.call(arguments, 1);

    objs.forEach(function(obj) {
        if (obj) {
            for (var k in obj) {
                var v = obj[k];
                if (v !== undefined && v !== null) {
                    des[k] = v;
                }
            }
        }
    });

    return des;
};

/**
 * 简单字符串模板支持
 */
exports.format = function(str, data) {
    return str.replace(/\{(\w+)\}/g, function(r, m) {
        return data[m] !== undefined && data[m] !== null ?
            data[m] : '{' + m + '}';
    });
};

/**
 * 取得host相关的配置
 */
exports.hostConfig = function(config, req) {
    var result = exports.extend({}, config);
    delete result.hosts;

    var hosts = config.hosts || {},
        parts = req.headers.host.split(':'),
        host = parts[0],
        port = parts[1] || '';

    result.host = host;
    result.port = port;

    return exports.extend(result, hosts[host]);
};

/**
 *  解析buffer成字符串
 */
exports.decodeBuffer = function(buf) {
    var MIN_CONFIDENCE = 0.96,
        DEFAULT_ENCODING = 'GB2312';

    if (!buf) {
        return false;
    }

    var iconv = require('iconv-lite');
    var jschardet = require('jschardet');

    var
        detectResult = jschardet.detect(buf),
        encoding = detectResult.encoding;

    if (detectResult.confidence < MIN_CONFIDENCE) {
        encoding = DEFAULT_ENCODING;
    }

    if (!encoding) {
        return false;
    }
    // fix ascii bug
    encoding = encoding === 'ascii' ? 'utf8' : encoding;
    return [iconv.decode(buf, encoding), encoding];
};

/**
 * 并行取得多个url的内容
 * @param urls
 * @param {function({array<{ error: error, content: content}>})}
 */
exports.getUrlsContent = function(urls, fn) {
    var ret = [];
    ret.length = urls.length;

    var check = function() {
        for (var i = 0, c = ret.length; i < c; i++) {
            if (!ret[i]) {
                return false;
            }
        }
        return true;
    };

    urls.forEach(function(url, index) {
        var i = 0;
        var get = function() {
            exports.getUrlContent(url, function(e, data) {
                if (e && i++ < 2) {
                    get();
                    return;
                }
                ret[index] = {error: e, content: data};
                check() && fn(ret);
            });
        };

        get();
    });

};

/**
 * 取得url内容
 */
exports.getUrlContent = function(url, fn) {
    util.debug('get url content: ' + url);
    var type = /^https/.test(url) ? 'https' : 'http',
        http = require(type);

    var callback = fn;

    http.get(url, function(res) {
        if (res.statusCode === 404 || res.statusCode === 302) {
            util.error('get url content error: ' + url + '[' + res.statusCode + ']');
            var error = new Error('get url content error: ' + url);
            error.status = res.statusCode;
            return callback(error);
        }

        var list = [];
        res.on('data', function(data) {
            list.push(data);
        });

        res.on('end', function() {
            callback(null, Buffer.concat(list));
        });

    }).on('error', callback);
};

/**
 * 对输出流根据指定扩展名进行过滤
 * @param type 扩展名, 不带.
 * @param function(buffer) 过滤函数
 */
exports.filter = function(req, res, next, type, fn) {
    var list = [],
        write = res.write,
        end = res.end,
        count = 0;

    type = Array.isArray(type) ? type : [type];

    var check = function() {
        var ext = req.fileext ? req.fileext.substr(1) : '';
        return type.indexOf(ext) !== -1 ||
            type.indexOf(req.query.type) !== -1
    };

    res.write = function(chunk) {
        check() ? list.push(chunk) :
            write.apply(res, arguments);
    };

    res.end = function(chunk) {
        res.write = write;
        res.end = end;

        count++;
        if (count > 1) {
            return next(new Error('invalid call'));
        }

        if (!check()) {
            return end.apply(res, arguments);
        }

        chunk && list.push(chunk);
        if (!list.length) {
            return end.call(res);
        }

        fn(Buffer.concat(list));
    };

    next();
};

exports.download = function(url, path, fn) {
    var http = require('http');
    http.get(url, function(res) {
        if (res.statusCode !== 200) {
            return fn(new Error('download error: ' + res.statusCode));
        }

        var Queue = require('./queue'),
            queue = new Queue(),
            fs = require('fs'),
            fd = null;

        queue.push(function(next) {
            fs.open(path, 'w', function(e, _fd) {
                if (e) {
                    return fn(e);
                }
                fd = _fd;
                next();
            });
        });

        res.on('data', function(chunk) {
            queue.push(function(next) {
                fs.write(fd, chunk, 0, chunk.length, null, function(e) {
                    if (e) {
                        return fn(e);
                    }
                    next();
                });
            });
        });

        res.on('end', function() {
            queue.push(function() {
                fs.close(fd, function() {
                    fn();
                });
            });
        });

    }).on('error', fn);
};

exports.outputResponse = function(res, type, buf) {
    buf = typeof buf === 'string' ? new Buffer(buf) : buf;
    res.setHeader('Content-Type', type);
    res.setHeader('Content-Length', buf.length);
    res.end(buf);
};

var cache = {};
exports.schedule = function(name, fn, delay) {
    var timer = cache[name];
    timer && clearTimeout(timer);
    cache[name] = setTimeout(function() {
        delete cache[name];
        fn();
    }, delay);
};
