/**
 * Created by Sandon on 2017/6/17.
 */
const processOneReq = require('./lib/processOneReq')

module.exports = async (ctx, next) => {
  const promises = ctx.state.yugReqUrls.map((url) => {
    return processOneReq(ctx.state.yugConfig, url.req)
  })

  await Promise.all(promises).then((results) => {
    ctx.state.yugReqUrls.forEach((url, index) => {
      url.res = results[index]
    })
  }).catch((e) => {
    throw e
  })

  await next()
}
