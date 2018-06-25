let user = require('./User.js');

console.log(`userName:${user.userName}`)

console.log(`sayHello:${user.sayHello()}`)


let http = require('http')

let url = require('url')

let util = require('util')

let server = http.createServer((req,res)=>{
	res.statusCode = 200;

	res.setHeader("Content-Type","text/html;charset=utf-8")

	res.end(util.inspect(url.parse('http://127.0.0.1:3000/index.html?a=123#tag')))
})

server.listen(3000,'127.0.0.1',()=>{
	console.log('服务器已经运行，请打开浏览器输入 127.0.0.0.1:3000')
})

