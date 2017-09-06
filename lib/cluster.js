/**
 * Created by Sandon on 2017/6/20.
 */
const path = require('path')
const cluster = require('cluster')
const fs = require('fs')
const utils = require('./utils')

const configFile = process.env.configFile
const pidFilePath = path.join(__dirname, '../run/app.pid')
const config = require(configFile)

var master = {
  start: function () {
    this._start()
    this._watch()
  },

  _start: function () {
    // console.log('pid is ->', process.pid)

    for (let id in cluster.workers) {
      cluster.workers[id].kill()
    }

    const os = require('os')
    const count = os.cpus().length
    for (var i = 0; i < count; i++) {
      cluster.fork()
    }

    cluster.on('exit', (worker) => {
      // console.log(`worker ${worker.process.pid} died`)
      process.exit(0)
    })
    cluster.on('error', (err) => {
      console.log(err)
      process.exit(0)
    })
  },

  _watch: function () {
    const self = this
    const watcher = fs.watch(configFile)
    watcher.on('change', function () {
      utils.schedule('start-cluster', function () {
        self._start()
      }, 2000)
    })
  }

}

var worker = {
  start: function () {
    const server = require('../lib/server')
    const app = server(config)

    if (config.sslport) {
      const https = require('https')
      const httpsOpt = {
        key: fs.readFileSync(config.key || path.join(__dirname, '../cert/server-key.pem')),
        cert: fs.readFileSync(config.cert || path.join(__dirname, '../cert/server-cert.pem')),
        ca: [fs.readFileSync(config.ca || path.join(__dirname, '../cert/ca-cert.pem'))]
      }

      https.createServer(httpsOpt, app.callback())
        .listen(config.sslport || 443)
        .on('error', function (e) {
          // console.error(e)
          throw e
          // process.exit(0)
        })
    }

    app.listen(config.port).on('error', function (e) {
      // console.error(e)
      throw e
      // process.exit(0)
    })
  }
}

if (cluster.isMaster) {
  fs.writeFileSync(pidFilePath, process.pid)
  // console.log(`pid of the master process where the server running is: ${process.pid}`)
}

if (!config.debug && cluster.isMaster) {
  master.start()
} else {
  worker.start()
}
