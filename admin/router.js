/**
 * Created by Sandon on 2019-03-29.
 */
const Router = require('koa-router')
const fs = require('fs')
const path = require('path')
const util = require('util')
const mime = require('mime')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const stat = util.promisify(fs.stat)

module.exports = (config) => {
  let admin = config.admin || '/yug/'
  admin = admin[0] === '/' ? admin : `/${admin}`
  admin = admin[admin.length - 1] === '/' ? admin : `${admin}/`
  const router = new Router()
  // admin
  router.get('/', getAssets)
  router.get('/assets/*', getAssets)
  router.get(`/getConfig`, getConfigFile(config))
  router.post(`/setConfig`, setConfigFile(config))

  return router
}

async function getAssets (ctx, next) {
  let filePath = './index.html'
  if (ctx.request.url !== '/') {
    filePath = `.${ctx.request.url}`
  }
  filePath = path.join(__dirname, filePath)
  let stats
  try {
    stats = await stat(filePath)
  } catch (e) {
    e.status = 404
    e.message = `'${filePath}' not found.`
    throw e
  }

  const pathMime = mime.lookup(filePath)
  const fileContent = await readFile(filePath)
  ctx.response.set({
    'content-type': pathMime,
    'rewrite-path': filePath
  })
  ctx.body = fileContent
}

function getConfigFile (config) {
  return async function (ctx, next) {
    const content = await readFile(config.__configFile, 'utf-8')
    // await writeFile(config.__configFile, content)
    ctx.body = {
      success: true,
      content
    }
  }
}

function setConfigFile (config) {
  return async function (ctx, next) {
    const str = ctx.request.rawBody.toString()
    const body = {}
    str.split('&').forEach((pair) => {
      if (pair) {
        const keyValue = pair.split('=')
        if (keyValue.length === 2) {
          body[keyValue[0]] = keyValue[1]
        }
      }
    })

    if (body['content']) {
      // console.log(decodeURIComponent(body['content']))
      await writeFile(config.__configFile, decodeURIComponent(body['content']))
      ctx.body = {
        success: true,
        content: ''
      }
    } else {
      ctx.body = {
        success: false,
        errMsg: 'content is empty',
        content: ''
      }
    }
  }
}
