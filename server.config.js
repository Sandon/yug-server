exports = module.exports = {
  port: 80, // port for http
  sslport: 443, // port for https
  debug: true,
  key: '', // path of key file for https which is passed to https.createServer, default is 'cert/server-key.pem'
  cert: '', // path of cert file for https which is passed to https.createServer, default is 'cert/server-cert.pem'
  ca: '', // path of ca file for https which is passed to https.createServer, default is 'cert/ca-cert.pem'
  middlewares: [
    'combo',
    'rewrite'
  ],
  hosts: {
    // simple host
    'www.demo.com': {
      root: '/Users/Sandon/WebstormProjects/'
    },

    // rewrite
    'www.styledemo.com': {
      root: '/Users/Sandon/WebstormProjects/',
      rewrite: [
        {
          from: /^\/yugserverrewrite\/(.*)$/,
          to: 'mine/yug-server/test/$1'
        },
        {
          from: /^\/yugserverrewritehttp\/(.*)$/,
          to: 'http://www.demo.com/mine/yug-server/test/$1'
        },
        {
          from: '^(.*)$',
          to: 'http://42.156.140.62$1'
        }
      ]
    }
  },
  headers: {
    // 'Access-Control-Allow-Origin': '*'
  }
}
