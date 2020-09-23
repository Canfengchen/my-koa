const config = require('./config')
const Koa = require('koa')

const router = require('koa-router')()

const bodyParser = require('koa-bodyparser')

const cors = require('./libs/koa-cors'); //跨域处理文件koa-cors.js

const checkToken = require('./util/checkToken')

const app = new Koa()

const controller = require('./controller');
app.use(bodyParser())
app.use(cors);
app.use(checkToken)

// 使用middleware:
app.use(controller());



app.use(router.routes())

app.listen(config.port)
console.log('app started at port 8090...');