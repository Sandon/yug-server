/**
 * Created by Sandon on 2017/6/16.
 */
const request = require('request')

/**
 * @param req
 * @param url
 * @returns {header, body}
 */
module.exports = async function rewriteToUrl (req, url) {
  return promisifyRequest(url)
}

function promisifyRequest (url) {
  return new Promise((resolve, reject) => {
    request(url, function (error, response, body) {
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
