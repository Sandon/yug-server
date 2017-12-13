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
      'headers': '',
      'rawbody': ''
    },
    'res': {
      'header': 'header',
      'body': 'body'
    }
  }
]

// Temporary version of response.
// yugServer extension middlewares may overwrite it before it is sent to client.
// yugServer base middleware (init) will finally send it to client.
ctx.state.yugPreRes = {
  'header': 'header',
  'body': 'body'
}
```

## 中间件处理流程
```
forward:  init -> combo -> rewrite -> process
backward: init <- combo <- rewrite <- process
```
