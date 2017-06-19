/**
 * Created by Sandon on 2017/6/16.
 */
module.exports = async (ctx, next) => {
  /* 1. prepare global properties */
  if (!ctx.state.yugReqUrls) {
    ctx.state.yugReqUrls = []
    ctx.state.yugReqUrls.push({
      req: ctx.request
    })
  }
  
  /* 2. go ahead processing */
  await next()
  
  /* 3. construct the pre response */
  ctx.state.yugPreRes = ctx.state.yugReqUrls[0].res
}
