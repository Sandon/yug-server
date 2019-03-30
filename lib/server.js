const getAdminRouter = require('../admin/router')

module.exports = function (config) {
  config = config || {}

  const Koa = require('koa')
  const app = new Koa()
  const getRawBody = require('raw-body')

  // get request body
  app.use(async (ctx, next) => {
    ctx.request.rawBody = await getRawBody(ctx.req, {
      length: ctx.req.headers['content-length'],
      // limit: '1000mb',
      encoding: ctx.charset // contentType.parse(ctx.req).parameters.charset
    })
    await next()
  })

  // admin service
  const adminRouter = getAdminRouter(config)
  app
    .use(adminRouter.routes())
    .use(adminRouter.allowedMethods())

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
