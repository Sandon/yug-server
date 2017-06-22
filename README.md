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
        port: 80,
        sslport: 443,
    	middlewares:[
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
    };


## Https
The yug-server supports https using self signed certificate.

So, when you are visiting urls that rewritten by yug-server, you will be blocked by the browser and get warnings.
You just need to ignore the warnings to go on.

Some urls that you are visiting are not obviously block by browser, like urls of CSS/JS files in Link/Script tag.
In order to visit these urls, you should manually enter the domains in the browser address bar before you visiting these domains.

You can change the cert that yug-server uses in 'cert' folder of the yug-server project.

## Combo URL
Support combo url like: `https://www.demo.com/??path1/file1.js,path2/file2.js`
