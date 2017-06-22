exports = module.exports = {
  port: 80,
  sslport: 443,
  debug: true,
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
  }
}
