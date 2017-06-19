# 备注

## ctx上的全局属性
```
// global properties on koa context
ctx.state.yugConfig = {}

ctx.state.yugReqUrls = [
  {
    'req': {
      'url': 'url',
      'path': 'path',
      'host': 'host'
    },
    'res': {
      'header': 'header',
      'body': 'body'
    }
  }
]

ctx.state.yugPreRes = {
  'header': 'header',
  'body': 'body'
}
```
