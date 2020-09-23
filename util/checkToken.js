const { parseToken } = require('./common')

const unCheckUrl = ["/user/login"]

async function checkToken(ctx, next) {
  let url = ctx.request.url;
  // 登录 不用检查
  if (unCheckUrl.includes(url)) await next();
  else {
      // 规定token写在header 的 'autohrization' 
    let token = ctx.request.headers["authorization"];
    if (!token) {
      ctx.body = {
        code: 1002,
        message:'不存在token'
      };
    } else {
      // 解码
      let { time, timeout } = await parseToken(token);
      let data = new Date().getTime();
      if (data - time <= timeout) {
          // 未过期
        await next();
      } else {
          //过期
        ctx.body = {
          code: 1001,
          message:'token 已过期'
        };
      }
    }
    
  }
}
 

module.exports = checkToken