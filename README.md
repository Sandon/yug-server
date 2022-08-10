# yug-server
a local proxy server, rewrite http requests to local files or remote servers, support combo mode and HTTPS.

[中文文档](./README.cn.md)

## Install
`sudo npm install -g yug-server`

## CLI Command
### start up
` sudo yug`


## Config
you can visit 127.0.0.1 to edit config. (maybe should change port to which you use)  
or  
you can edit the config file directly, path of config file is ` ~/yug-config/server.config.js `.  

config content as :

    exports = module.exports = {
      port: 80, // port for http
      sslport: 443, // port for https
      key: '', // path of key file for https which is passed to https.createServer, default is 'cert/server-key.pem'
      cert: '', // path of cert file for https which is passed to https.createServer, default is 'cert/server-cert.pem'
      ca: '', // path of ca file for https which is passed to https.createServer, default is 'cert/ca-cert.pem'
      middlewares: [
        'combo',
        'rewrite'
      ],
      hosts: {
        // simple host static files under ${root}
        'www.demo.com': {
          root: '/Users/Sandon/WebstormProjects/'
        },
    
        // rewrite to file system or remote server.
        // first match of rewrite rules in ${rewrite} that return 200 will be used,
        // so the order of the rules in ${rewrite} matter.
        'www.styledemo.com': {
          root: '/Users/Sandon/WebstormProjects/',
          rewrite: [
            // rewrite to file system under the ${root}
            // in this configuration, it is '/Users/Sandon/WebstormProjects/mine/yug-server/test/$1'
            {
              from: /^\/yugserverrewrite\/(.*)$/,
              to: 'mine/yug-server/test/$1'
            },
            // rewrite to remote server
            {
              from: /^\/yugserverrewritehttp\/(.*)$/,
              to: 'http://www.demo.com/mine/yug-server/test/$1'
            },
            // also rewrite to remote server
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



## HTTPS
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
