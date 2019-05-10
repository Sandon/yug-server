# yug-server
一个本地代理服务 (将HTTP请求代理到本地文件或者另一个HTTP请求上，支持combo模式和HTTPS)

[English Readme.md](./README.en.md)

## 安装
`sudo npm install -g yug-server`

## 命令
### 启动
`sudo yug`


## 配置
可以访问 http://127.0.0.1 进行配置（默认是80端口，如果修改了端口则使用你所配置的端口）；  
也可以直接编辑配置文件进行配置，配置文件路径` ~/yug-config/server.config.js `

配置内容 :

    exports = module.exports = {
      port: 80, // http端口
      sslport: 443, // https端口
      key: '', // 使用https时需要的 key 文件的路径，默认是'cert/server-key.pem'（本包的安装位置下）， 这个值会被传递给node中的https.createServer
      cert: '', // 使用https时需要的 cert 文件的路径，默认是'cert/server-cert.pem'（本包的安装位置下）， 这个值会被传递给node中的https.createServer
      ca: '', // 使用https时需要的 ca 文件的路径，默认是'cert/ca-cert.pem'（本包的安装位置下）， 这个值会被传递给node中的https.createServer 
      middlewares: [
        'combo',
        'rewrite'
      ],
      hosts: {
        // 提供对${root}下的文件的静态访问，通过'www.demo.com'进行访问
        'www.demo.com': {
          root: '/Users/Sandon/WebstormProjects/'
        },
    
        // 将请求代理到本地文件或另一个HTTP请求上
        'www.styledemo.com': {
          root: '/Users/Sandon/WebstormProjects/',
          // rewrite 数组中包含各个代理的规则，从上到下按规则进行代理请求，第一个状态码为200的response将会被返回
          // 规则包含'from'和'to'属性，两个属性值都是正则表达式，将会把'from'匹配的内容用'to'替代
          rewrite: [
            // 代理到本地文件：代理到${root} 下的文件，此例中，即'/Users/Sandon/WebstormProjects/'下的文件
            // 在如下格则中，请求'www.styledemo.com/yugserverrewrite/index.css' 将会被映射到文件 '/Users/Sandon/WebstormProjects/mine/yug-server/test/index.css'
            {
              from: /^\/yugserverrewrite\/(.*)$/,
              to: 'mine/yug-server/test/$1'
            },
            // 代理到另一个http请求
            {
              from: /^\/yugserverrewritehttp\/(.*)$/,
              to: 'http://www.demo.com/mine/yug-server/test/$1'
            },
            // 也是代理到另一个http请求，因为'from'正则能匹配所有，所以此规则能作为最后的兜底
            {
              from: '^(.*)$',
              to: 'http://42.156.140.62$1'
            }
          ]
        }
      },
      // 设置返回的response的头信息
      headers: {
        'Access-Control-Allow-Origin': '*'  
      }
    }



## HTTPS
`yug-server` 支持HTTPS，也提供了默认的证书（位置在yug-server安装目录中的'cert/'文件夹中）. 
您可以在配置中修改使用的证书(通过`key`,`cert`,`ca`属性设置).

#### 使用默认的证书时
由于我们提供的证书是一个自签名的证书，浏览器会拦截并提示警告，您有如下两个解决方案：
1. 简单地忽略，并继续；
2. **[推荐]** 将默认证书添加到系统的受信证书列表中；（位置在yug-server安装目录中的'cert/'文件夹中）

**提醒**：HTML中对资源(CSS/JS/IMG)的请求在被浏览器拦截的情况下，可能没有那么容易被发现，
需要您打开控制台来查看，如果您选择了上述解决方案1，那么也需要您手动在浏览器中打开这些资源的地址，然后"忽略提示，并继续"。

推荐使用方案2，它能避免频繁地需要操作"忽略提示，并继续"。

## Combo URL
支持 combo 模式的url地址， 样例: `https://www.demo.com/??path1/file1.js,path2/file2.js`  
combo 模式能够一次请求获取多个文件，目前已经广泛应用于网页的性能优化中。
