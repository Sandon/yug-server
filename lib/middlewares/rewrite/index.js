/**
 * Created by Sandon on 2017/6/16.
 */
const rewriteToUrl = require('./lib/rewriteToUrl')
const rewriteToFs = require('./lib/rewriteToFs')

module.exports = async (ctx, next) => {
  // await rewriteToUrl(ctx.req, 'https://www.baidu.com')
  const result = await rewriteToFs('/Users/Sandon/WebstormProjects/mine/')
  //console.log(ctx.res)
  //ctx.res.headers['content-type'] = result.mime
  ctx.response.set({
    'content-type': result.mime
  })
  ctx.res.end(result.content)
  ctx.res.statusCode = 200
  await next()
}
