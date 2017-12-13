/**
 * Created by Sandon on 2017/6/16.
 */
const request = require('request')
const { URL } = require('url')

/**
 * @param req
 * @param url: rewritten url
 * @returns {header, body}
 */
module.exports = async function rewriteToUrl (req, url) {
  const myURL = new URL(url)
  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      method: req.method,
      // change host, but not affect req.headers
      headers: Object.assign({}, req.headers, {
        host: myURL.host, // rewritten host
        'accept-encoding': 'identity' // do not compress
      }),
      body: req.rawBody
    }
    request(options, function (error, response, body) {
      if (error) {
        reject(error)
        return
      }
      response.headers['rewrite-path'] = url
      resolve({
        header: response.headers,
        body
      })
    })
  })
}
