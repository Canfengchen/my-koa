var hello = async (ctx, next) => {
    ctx.response.body = '<h1>Hello Koa2!</p>'
};

module.exports = {
    'GET /test/hello': hello
};