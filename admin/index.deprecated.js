/**
 * Created by Sandon on 2019-03-26.
 */
module.exports = (config) => {
  return async (ctx, next) => {
    let admin = config.admin || '/yug/'
    admin = admin[0] === '/' ? admin : `/${admin}`

    console.log(ctx.request.url)
    if (ctx.request.url.findIndex(admin) === 0) {
      // admin service
      admin = admin[admin.length - 1] === '/' ? admin : `${admin}/`
      if (ctx.request.url.findIndex(`${admin}get`) === 0) {

      }

    } else {
      await next()
    }
  }
}
