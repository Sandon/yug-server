module.exports = function (config) {
  config = config || {}

  const Koa = require('koa')
  const app = new Koa()
  const getRawBody = require('raw-body')
  const contentType = require('content-type')

  // get request body
  app.use(async (ctx, next) => {
    ctx.request.rawBody = await getRawBody(ctx.req, {
      length: ctx.req.headers['content-length'],
      limit: '1000mb',
      encoding: contentType.parse(ctx.req).parameters.charset
    })
    await next()
  })

  // base middleware 'init'
  app.use(require('./middlewares/init/index')(config))

  // extension middlewares
  config.middlewares.forEach(function (name) {
    const middleware = require(`./middlewares/${name}/index.js`)
    app.use(middleware)
  })

  // base middleware 'process'
  app.use(require('./middlewares/process/index.js'))

  return app
}
