# yug-server
a local development server

## Install
` npm install -g yug-server `

## CLI Command
**start** : ` sudo yug-server [options]`

options is :

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

