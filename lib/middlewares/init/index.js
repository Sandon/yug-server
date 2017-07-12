'use strict'

module.exports = (config) => {
  return async (ctx, next) => {
    if (ctx.request.url === '/favicon.ico') {
      return
    }

    /* 1. prepare config */
    for (let host in config.hosts) {
      if (config.hosts.hasOwnProperty(host) && config.hosts[host].rewrite && config.hosts[host].rewrite.length) {
        config.hosts[host].rewrite.forEach((rule) => {
          if (typeof rule.from === 'string') {
            rule.from = new RegExp(rule.from)
          }

          if (!rule.test) {
            rule.test = function (path) {
              return this.from && this.from.test(path)
            }
          }
        })
      }
    }
    ctx.state.yugConfig = config

    try {
      /* 2. go ahead */
      await next()

      /* 3. construct the response from the pre response(ctx.yugPreRes) */
      ctx.set(ctx.state.yugPreRes.header)
      ctx.set(config.headers)
      ctx.status = 200
      ctx.body = ctx.state.yugPreRes.body
    } catch (err) {
      ctx.status = err.statusCode || err.status || 500
      ctx.body = {
        from: 'yug-server',
        message: err.message
      }
    }
  }
}
