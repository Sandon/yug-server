/**
 * Created by Sandon on 2017/6/17.
 */
// If there is no rewrite rule or the path does not match any rules,
// yug-server serves static files from the root without any rewrites

// If there are rules match the path, respond with the first succeed.
// If all are failed, respond with a warning.

// If the rewritten path is a http url, the final rewritten url includes the query string.
// Otherwise the final rewritten url(file path) doesn't include the query string

const rewriteToUrl = require('./rewriteToUrl')
const rewriteToFs = require('./rewriteToFs')
const path = require('path')

/**
 * @param config
 * @param req: {host, url, path, charset} / Koa request
 * @returns {header, body}
 */
module.exports = async function processOneReq (config, req) {
  if (!config || !config.hosts || !config.hosts[req.host]) {
    throw new Error(`wrong configure, no config for host "${req.host}"`)
  }

  let hostCofig = config.hosts[req.host]
  let rewriteRules = hostCofig.rewrite || []

  // If there are rules match the path, respond with the first succeed.
  // If all are failed, respond with a warning
  let matched = false
  let result
  let succeed = false
  let errArr = []
  for (let rule of rewriteRules) {
    if (rule.test(req.path)) {
      !matched && (matched = true)
      try {
        result = await tryRewrite(hostCofig, rule, req)
        succeed = true
        break
      } catch (e) {
        errArr.push(e.toString())
      }
    }
  }

  if (!matched) {
    // If there is no rewrite rule or the path does not match any rules,
    // yug-server serves static files from the root without any rewrites
    result = rewriteToFs(path.join(hostCofig.root, req.path), req.path, req.charset || undefined)
  } else if (!succeed) {
    // If all are failed, respond with a warning
    let msg = `All matched rules failed! Can't get the resources specified by the rules!   `
    msg += `matching errors detail:   ${errArr.join('   ')}`

    throw new Error(msg)
  }

  return result
}

async function tryRewrite (hostCofig, rule, req) {
  const from = rule.from
  const to = rule.to
  const rewrittenPath = req.path.replace(from, to)
  const rewrittenUrl = req.url.replace(from, to)

  if (/^http(s)?:\/\//.test(rewrittenUrl)) {
    // If it is a http request, rewrite it with url which contain parameters
    return rewriteToUrl(req, rewrittenUrl)
  } else {
    // If it is a file system request, rewrite it with path which don't contain parameters
    return rewriteToFs(path.join(hostCofig.root, rewrittenPath), rewrittenPath, req.charset || undefined)
  }
}
