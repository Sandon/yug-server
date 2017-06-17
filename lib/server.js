"use strict";

module.exports = function( config ) {
	config = config || {}

  const Koa = require('koa')
  const app = new Koa()
  
  // var koaStatusCode = require('./middlewares/koa-statusCode')
  // fix koa 404 bug
  // app.use(koaStatusCode(200))

  app.use( require('./init')(config) )

  config.middlewares.forEach(function (name) {
    var middleware = require(`./middlewares/${name}/index.js`)
    app.use(middleware)
  })
	
	return app;
}
