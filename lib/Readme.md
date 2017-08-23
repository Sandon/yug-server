# 备注

## ctx上的全局属性
```
/* global properties on koa context */

// config
ctx.state.yugConfig = {}

// yugServer extension middlewares (combo/rewrite) prepare ctx.state.yugReqUrls[i].req
// yugServer base middleware(process) produce ctx.state.yugReqUrls[i].res based on ctx.state.yugReqUrls[i].req
ctx.state.yugReqUrls = [
  {
    'req': {
      'url': 'url',
      'path': 'path',
      'host': 'host',
      'charset': 'charset',
      'headers', ''
    },
    'res': {
      'header': 'header',
      'body': 'body'
    }
  }
]

// Temporary version of response.
// Because yugServer extension middlewares may overwrite it before it is sent to the client.
ctx.state.yugPreRes = {
  'header': 'header',
  'body': 'body'
}
```
