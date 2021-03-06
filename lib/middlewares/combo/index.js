/**
 * Created by Sandon on 2017/6/19.
 */
module.exports = async (ctx, next) => {
  let url = ctx.request.url
  // if the url don't match the combo style, then do nothing
  const patternResult = /^([^?]*\/)\?\?([^?]+)/.exec(url)
  if (!patternResult) {
    await next()
    return
  }

  /* 1. prepare global properties */
  const subUrls = patternResult[2].split(',')
    .filter((subUrl) => !!subUrl.trim().length)
    .map((subUrl) => `${patternResult[1]}${subUrl}`)
  // if ctx.state.yugReqUrls has been built by others already, then ignore it
  if (!ctx.state.yugReqUrls) {
    ctx.state.yugReqUrls = []
    subUrls.forEach((subUlr) => {
      ctx.state.yugReqUrls.push({
        req: {
          url: subUlr,
          path: subUlr,
          host: ctx.request.host,
          charset: ctx.request.charset,
          headers: ctx.request.headers,
          rawBody: ctx.request.rawBody
        }
      })
    })
  }
  /* 2. go ahead processing */
  await next()

  /* 3. construct the pre response */
  let acc = {body: '', rewritePath: ''}
  ctx.state.yugReqUrls.reduce((acc, val) => {
    acc.body += val.res.body + '\n'
    acc.rewritePath += acc.rewritePath ? `,${val.res.header['rewrite-path']}` : val.res.header['rewrite-path']
    return acc
  }, acc)

  ctx.state.yugPreRes = {
    header: {
      // determined by the mime type of the first resource
      'content-type': ctx.state.yugReqUrls[0].res.header['content-type'],
      'rewrite-path': acc.rewritePath
    },
    body: acc.body
  }
}
