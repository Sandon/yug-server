/**
 * Created by Sandon on 2017/6/16.
 */
const { URL } = require('url')
const fetch = require('node-fetch') 

/**
 * @param req: format is ctx.state.yugReqUrls[0].req style
 * @param url: rewritten url
 * @returns {header, body}
 */
module.exports = async function rewriteToUrl (req, url) {
  const myURL = new URL(url)
  
  const options = {
    method: req.method,
    // change host, but not affect req.headers
    headers: Object.assign({}, req.headers, {
      host: myURL.host, // rewritten host
      'accept-encoding': 'identity' // do not compress
    })
  }
  req.rawBody.length && (options.body = req.rawBody)
  
  const response = await fetch(url, options)
  const headers = {}
  for (let key of response.headers.keys()) {
    headers[key] = response.headers.get(key)
  }
  headers['rewrite-path'] = url
  
  return {
    header: headers,
    body: response.body
  }
}
