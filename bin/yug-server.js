#!/usr/bin/env node

const util = require('util')
const path = require('path')
const fs = require('fs')
const cluster = require('cluster')
const shell = require('shelljs')
const utils = require('../lib/utils')
const nopt = require('nopt')
const chokidar = require('chokidar')

const packageInfo = require('../package.json')
const CONFIG_DIR = 'yug-config'
const CONGIF_FILENAME = 'server.config.js'
const defaultConfigPath = (function () {
  let home =  process.env[ process.platform == 'win32' ? 'USERPROFILE' : 'HOME' ]
  home = path.resolve(home, CONFIG_DIR)
  if ( !fs.existsSync(home) ) {
    shell.mkdir( '-p', home )
    shell.cp('', path.resolve( __dirname, '../' + CONGIF_FILENAME ), home)
  }
  return path.resolve( home, CONGIF_FILENAME )
})()
let PID = null

const knownOpts = {
  'configfile': String,
  'pidfile': String,
  'debug': Boolean,
  'port': Number,
  'help': Boolean
}
const shortHands = {
  'p': [ '--port' ],
  'd': [ '--debug' ],
  'cf': [ '--configfile' ],
  'pf': [ '--pidfile' ],
  'h': [ '--help' ]
}

/* 1. handle the command line parameters */
let parsed = nopt(knownOpts, shortHands, process.argv)
let debug = parsed.debug
let configFile = parsed.configfile || defaultConfigPath
let serverPidFile = parsed.pidfile ? path.resolve(parsed.pidfile) : path.join( __dirname, '../run/app.pid' )

if (parsed.help) {
  console.log([
    ` Version: ${packageInfo.version}`,
    ' Usage: sudo yug [options]',
    '',
    ' Options:',
    '',
    '   -d   | --debug           [option] enable debug mode',
    '   -p   | --port            [option] port num',
    '   -cf  | --configfile      [option] path to config file',
    '   -h   | --help            [option] help information',
    '   -v   | --version         [option] version'
  ].join('\n'))
  return
}
if (parsed.version) {
  console.log(` Version: ${packageInfo.version}`)
  return
}

/* 2. run the servers */
const master = {
  start: function() {
    this._start()
    this._watch()
  },
  
  _start: function () {
    for ( let id in cluster.workers ) {
      cluster.workers[id].kill()
    }
    
    const os = require( 'os' )
    const count = os.cpus().length
    for (let i = 0; i < count; i++) {
      cluster.fork()
    }

    console.log('yug server start successfully, pid is:', PID)

    cluster.on( 'exit', function ( worker ) {
      // util.log( 'worker ' + worker.process.pid + ' died' )
    })
  },

  _watch: function () {
    let self = this

    if (!fs.existsSync(configFile)) {
      throw new Error( `config file '${configFile}' does not exist` )
    }

    const watcher = chokidar.watch(configFile, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    })
    watcher.on('change', function () {
      console.log('config file is changed')
      utils.schedule( 'start-cluster', function () {
        console.log('config file is changed, restart the server...')
        self._start()
      }, 1000)
    })

    // fs.watchFile(configFile, function () {
    //   utils.schedule( 'start-cluster', function () {
    //     console.log('config file is changed, restart the server...')
    //     self._start()
    //   }, 1000)
    // })
  }
}

const worker = {
  start: function() {
    const config = require(configFile)
    config.__configFile = configFile
    config.port = parsed.port || config.port
    config.debug = debug || config.debug
    
    const server = require('../lib/server')
    const app = server(config)
    
    if (config.sslport) {
      const https = require('https')
      const httpsOpt = {
        key: fs.readFileSync( path.join(__dirname, '../cert/server-key.pem') ),
        cert: fs.readFileSync( path.join(__dirname, '../cert/server-cert.pem') ),
        ca: [fs.readFileSync( path.join(__dirname, '../cert/ca-cert.pem') )]
      };
      
      https.createServer(httpsOpt, app.callback())
        .listen( config.sslport || 443 )
        .on( 'error', function(e) {
          util.error(e)
        })
    }
    
    app.listen(config.port).on('error', function(e) {
      util.error(e)
    })
  }
}

if (cluster.isMaster) {
  PID = process.pid
  fs.writeFileSync(serverPidFile, PID)
}

if (!debug && cluster.isMaster) {
  master.start()
} else {
  worker.start()
}

process.on('SIGTERM', function () {
  console.log('sigterm ...')
  process.exit(0)
})

