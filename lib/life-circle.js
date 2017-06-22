/**
 * Created by Sandon on 2017/6/20.
 */
const { spawn, exec } = require('child_process')
const fs = require('fs')
const path = require('path')

const pidFilePath = path.join(__dirname, '../run/app.pid')
const clusterPath = path.join(__dirname, './cluster.js')

module.exports.start = (force) => {
  // check whether the server is already running
  if (!force) {
    let pid = fs.readFileSync(pidFilePath, {encoding: 'utf-8'})
    if (pid) {
      console.log(`yug-server is already running!`)
      console.log(`master process pid is: ${pid}.`)
      console.log(`please try restart the server or run 'sudo yug start -f' to force start.`)
      return
    }
  }
  console.log(`force start: ${!!force}`)
  // run the server
  let handlerProcess = spawn('node', [clusterPath, ' &'], {
    stdio: 'inherit',
    shell: true
  })
  startTip()
  /*exec(`node ${clusterPath}`, {
    stdio: 'inherit'
  }, (error, stdout, stderr) => {
    if (error) {
      console.log(error)
      throw error
    }
   startTip();
  })*/
}

module.exports.stop = (fn) => {
  // check whether the server is already not running
  let pid = fs.readFileSync(pidFilePath, {encoding: 'utf-8'})
  if (!pid) {
    console.log('yug-server is not running')
    return
  }
  
  // stop the server
  exec(`kill -9 ${pid}`, {
    stdio: 'inherit'
  }, (error, stdout, stderr) => {
    if (error)
      throw error
    console.log(stdout)
    fn && fn()
  })
  fs.writeFileSync(pidFilePath, '')
  console.log(`kill process: ${pid}`)
  console.log(`stop the server successfully.`)
}

module.exports.restart = () => {
  let pid = fs.readFileSync(pidFilePath, {encoding: 'utf-8'})
  const self = this
  if (!pid) {
    self.start()
  } else {
    self.stop(() => {
      self.start()
    })
  }
}

module.exports.status = () => {
  let pid = fs.readFileSync(pidFilePath, {encoding: 'utf-8'})
  if (pid) {
    console.log(`yug-server is already running.`)
    console.log(`master process pid is: ${pid}.`)
  } else {
    console.log(`yug-server is not running.`)
  }
}

module.exports.startNotShell = () => {
  spawn('node', [clusterPath], {
    stdio: 'inherit'
  })
}

function startTip () {
  setTimeout(() => {
    let pid = fs.readFileSync(pidFilePath, {encoding: 'utf-8'})
    if (pid) {
      console.log(`start server successfully. pid: ${pid}`)
    } else {
      console.log(`start server failed.`)
    }
  }, 2000)
}
