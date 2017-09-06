# yug-server
a local development server (combo and rewrite http requests to local files or remote servers)

## Install
` npm install -g yug-server `

## CLI Command
### front end start up
**start**: ` sudo yug`

### back end start up
**start**    : ` sudo yug start`
**stop**     : ` sudo yug stop`
**status**   : ` sudo yug status`
**restart**  : ` sudo yug restart`

options are :

| option              | meaning                      |
| ------------------- | ---------------------------- |
| -cf  / --configfile | [option] path to config file |
| -f   / --force      | [option] force start like 'sudo yug start -f'       |
| -h   / --help       | [option] help information    |
| -v   / --version    | [option] version             |


## Config
path of the config file is ` ~/yug-config/server.config.js `.

config content as :

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
      // common header for every responce
      headers: {
        'Access-Control-Allow-Origin': '*'  
      }
    }



## Https
The yug-server supports https using a default self signed certificate.

You can change the cert that yug-server uses in 'server.config.js'.

#### When using default self signed certificate
you may will be blocked by the browser and get warnings.
You can just ignore the warnings and go on.
Or you can add the default cert to the trusted certs list on system(Mac and Windows).

Some urls that you are visiting are not obviously block by browser, like urls of CSS/JS files in Link/Script tag.
In order to visit these urls, you should manually input the domains in the browser address bar before you visiting these domains.

## Combo URL
Support combo url like: `https://www.demo.com/??path1/file1.js,path2/file2.js`
