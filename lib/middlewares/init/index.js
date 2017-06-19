"use strict";

module.exports = (config) => {
  return async (ctx, next) => {
    if ('/favicon.ico' == ctx.request.url) {
      return
    }
  
    /*for (let host in config.hosts) {
      if (config.hosts.hasOwnProperty(host) && host.rewrite && host.rewrite.length) {
        host.rewrite.forEach((rule) => {
          
        })
      }
    }*/
    ctx.state.yugConfig = config
    
    try {
      await next()
      
      // construct the response from the pre response(ctx.yugPreRes)
      console.log(ctx.state.yugPreRes)
      ctx.set(ctx.state.yugPreRes.header)
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
