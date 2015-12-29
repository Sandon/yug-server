var // fs = require('fs'),
    Path = require( 'path' ),
    http = require( 'http'),
    mime = require( 'mime' ),
    index = require( 'serve-index' ),
    //co = require( 'co' ),
    fs = require( 'mz/fs' ),
    send = require( 'koa-send' );

module.exports = function () {
    return function *( next ) {
        var config = this.request.config;
        if ( config && config.hosts && config.hosts[ this.request.host ] ) {
            yield process( this );
        }

        yield next;
    }
};

function process( ctx ) {
    return function *() {
        var req = ctx.request,
            res = ctx.response,
            host = req.config.hosts[ req.host ],
            rewrite = host.rewrite || [],
            len = rewrite.length,
            rule = {};
        rule.host = host.root;
        rule.url = ctx.url;
        rule.path = ctx.path;

        if ( 0 == len ) {
            if ( /^http(s)?:\/\//.test( rule.url ) ) {
                yield rewriteToUrl( ctx, rule );
            } else {
                yield rewriteToFs( ctx, rule );
            }
        } else {
            for ( var i = 0; i != len; i ++ ) {
                rule.from = rewrite[i].from;
                rule.to = rewrite[i].to;

                rule.from = typeof rule.from === 'string' ? new RegExp( rule.from ) : rule.from;
                rule.test = rule.test || function( path ) {
                    return rule.from && rule.from.test( path );
                };

                if ( rule.test( req.path ) && ( yield tryRewrite( ctx, rule ) ) ) {
                    break;
                }
            }
        }
    };
}


function tryRewrite( ctx, rule ) {
    return function *() {
        var req = ctx.request,
            res = ctx.response;

        var config = req.config,
            to = rule.to;

        if ( typeof to === 'string' ) {
            to = to.replace( /\{([_a-zA-Z]\w*)\}/g, function( m, name ) {
                return config[ name ] || m;
            });
        }

        rule.path = ctx.path.replace( rule.from, to );

        if ( /^http(s)?:\/\//.test( rule.path ) ) {
            return yield rewriteToUrl(ctx, rule);
        } else {
            return yield rewriteToFs( ctx, rule );
        }
    }
}

function rewriteToUrl ( ctx, rule ) {
    var req = ctx.req,
        res = ctx.res;
    return function ( next ) {
        http.get( rule.path, function( r ) {
            var body = '';
            if ( 404 === r.statusCode ) {
                res.statusCode = 404;
                next( null, false );
                return;
            }

            if ( 302 === r.statusCode ) {
                res.statusCode = 302;
                res.setHeader( 'location', r.headers.location );
                res.end();
            }
            ctx.response.set({
                'File-Path': rule.path
            });
            r.on( 'data', function( data ) {
                res.write( data )
                //data && ( body += data );
            });

            r.on( 'end', function( data ) {
                res.end( data );
                //data && ( body += data );
                //ctx.body = 'x';
                next( null, true );
            });
        });
    }
}

function rewriteToFs( ctx, rule ) {
    var req = ctx.request,
        res = ctx.response;

    return function *() {
        var path = Path.join( rule.host, rule.path );
        var newPath	= Path.join( req.config.root || '', path );

        if ( yield fs.exists( newPath ) ) {
            return yield doRewrToFs( newPath );
        } else if ( yield fs.exists( path ) ) {
            return yield doRewrToFs( path );
        } else {
            return false
        }

        function doRewrToFs ( path ) {
            return function *() {
                try {
                    var stat = yield fs.stat( path );
                    res.set({
                        'Content-Type': mime.lookup( path ),
                        'File-Path': path
                    });

                    if ( stat.isFile() ) {
                        yield send( ctx, rule.path, { root: rule.host } )
                    } else if ( stat.isDirectory() ) {
                        yield toDir( ctx, rule.host )
                    }
                } catch ( err ) {
                    throw ( err );
                }
                return true;
            };
        }
        function toDir ( ctx, path ) {
            return function ( next ) {
                index( path )( ctx.req, ctx.res, next );
            }
        }
    };
}

