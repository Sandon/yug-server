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
 * @param fsPath
 * @returns {header, body}
 */
module.exports = async function rewriteToFs (fsPath, onlyFile) {
  const pathMime = mime.lookup(fsPath)
  const stats = await stat(fsPath)
  
  if (stats.isFile()) {
    return {
      content: await readFile(fsPath),
      mime: pathMime
    }
  } else if (stats.isDirectory()) {
    // when onlyFile set to true
    if (onlyFile) {
      throw new Error (`${fsPath} is dir not file.`)
    }
    
    // get html content based on file list
    let files = await readdir(fsPath)
    files = files.map((file) => {
      return {
        fileName: file,
        filePath: path.join(fsPath, file)
      }
    })
    const data = {title: fsPath, lists: files}
  
    const source = await readFile(path.join(__dirname, './index.html'), 'utf-8')
    const template = Handlebars.compile(source)
    return {
      header: {'content-type': 'text/html'},
      body: template(data)
    }
  } else {
    throw new Error (`don't support the type of ${fsPath}`)
  }
}
