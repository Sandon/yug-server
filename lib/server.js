"use strict";

module.exports = function( config ) {
	config = config || {};

    var koa = require( 'koa' );
    var app = koa();
    var koaStatusCode = require( './middlewares/koa-statusCode' );

    // fix koa 404 bug
    app.use( koaStatusCode( 200 ) );

    app.use( ( require( './middlewares/bind-config' ) )( config ) );

    config.middlewares.forEach( function( name ) {
        var filter = require( './middlewares/' + name );

        app.use( filter() );
    });
	
	return app;
};