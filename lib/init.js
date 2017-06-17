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
    ctx.request.config = config
    
    try {
      await next()
    } catch (err) {
      for (let key in err) {
        console.log(key)
      }
      console.log(err)
      console.log(err.name, ',',  err.message)
      ctx.status = err.statusCode || err.status || 500
      ctx.body = {
        message: err.message
      }
    }
  }
}
