/**
 * Created by Sandon on 2017/6/16.
 */
/*module.exports = async (ctx, next) => {
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
}*/

module.exports = async (ctx, next) => {
  // prepare global properties
  if (!ctx.state.yugReqUrls) {
    ctx.state.yugReqUrls = []
    ctx.state.yugReqUrls.push({
      req: {
        url: ctx.url,
        path: ctx.path,
        host: ctx.host
      }
    })
  }
  
  // go ahead processing
  await next()
  
  // construct the pre response
  ctx.state.yugPreRes = ctx.state.yugReqUrls[0].res
}
