/**
 * Created by Sandon on 2017/8/14.
 */
const Koa = require('koa')
const app = new Koa()

app.use(async (ctx, next) => {
  ctx.body = 'ok'
  ctx.status = 200
})

app.listen(3000)
