/**
 * Created by Sandon on 2017/6/16.
 */
const util = require('util')
const fs = require('fs')
const mime = require('mime')
const path = require('path')
const Handlebars = require('handlebars')

const stat = util.promisify(fs.stat)
const readFile = util.promisify(fs.readFile)
const readdir = util.promisify(fs.readdir)

/**
 * @param fsPath: path of target file or directory
 * @param pathPrefix: path prefix when serve directory
 * @param encoding: default utf-8
 * @param onlyFile: whether the {fsPath} must be file
 * @returns {header, body}
 */
module.exports = async function rewriteToFs (fsPath, pathPrefix, encoding = 'utf-8', onlyFile) {
  const pathMime = mime.lookup(fsPath)
  let stats
  try {
    stats = await stat(fsPath)
  } catch (e) {
    e.status = 404
    e.message = `'${fsPath}' not found.`
    throw e
  }

  if (stats.isFile()) {
    let content = await readFile(fsPath)
    content = content.toString(encoding)
    return {
      header: {
        'content-type': pathMime,
        'rewrite-path': fsPath
      },
      body: content
    }
  } else if (stats.isDirectory()) {
    // when onlyFile set to true
    if (onlyFile) {
      throw new Error(`${fsPath} is dir not file.`)
    }

    // get html content based on file list
    let files = await readdir(fsPath)
    files = files.map((file) => {
      return {
        fileName: file,
        filePath: path.join(pathPrefix, file)
      }
    })
    const data = {title: fsPath, lists: files}

    const source = await readFile(path.join(__dirname, './index.html'), 'utf-8')
    const template = Handlebars.compile(source)
    return {
      header: {
        'content-type': 'text/html',
        'rewrite-path': fsPath
      },
      body: template(data)
    }
  } else {
    throw new Error(`don't support the type of ${fsPath}`)
  }
}
