module.exports = function( config ) {
	config = config || {}

  const Koa = require('koa')
  const app = new Koa()

  app.use( require('./middlewares/init/index')(config) )

  config.middlewares.forEach(function (name) {
    const middleware = require(`./middlewares/${name}/index.js`)
    app.use(middleware)
  })
  
  app.use(require('./middlewares/process/index.js'))
	
	return app
}
