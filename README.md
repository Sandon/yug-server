# yug-server
a local development server

## Install
` npm install -g yug-server `

## CLI Command
**start** : ` sudo yug-server [options]`

options are :

| option              | meaning                      |
| ------------------- | ---------------------------- |
| -d   / --debug      | [option] enable debug mode   |
| -p   / --port       | [option] port num            |
| -cf  / --configfile | [option] path to config file |
| -h   / --help       | [option] help information    |


## Config
path of the config file is ` ~/yug-config/server.config.js `.

config content as :

    exports = module.exports = {
        port: 80,
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

So, when you are visiting urls that rewrited by yug-server, you will be blocked by the browser and get warnings.
You just need to ignore the warnings to go on.

Some urls that you are visiting are not abviously block by browser, like urls of CSS/JS files in Link/Script tag.
In order to visit these urls, you should manually enter the domains in the browser address bar before you visiting these domains.

You can change the cert that yug-server uses in 'cert' folder of the yug-server project.