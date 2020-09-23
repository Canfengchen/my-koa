const query = require('../libs/mysql')
const { listToTree, concatKeyValue, concatWhere, concatUpdate } = require('../util/tools')

var addAuth = async (ctx, next) => {
    const postData = ctx.request.body
    const {keys, values} = concatKeyValue(postData)
    // let {parentId, title, access} = ctx.request.body
    let sql = `insert into auth (${keys.join(',')}) values (${values.join(',')})`
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            msg: '添加成功'
        }
    })
    ctx.body = response
}

var updateAuth = async (ctx, next) => {
    const postData = ctx.request.body
    const id = postData.id
    delete postData.id
    const setStr = concatUpdate(postData)
    // let {parentId, title, access} = ctx.request.body
    let sql = `update auth set ${setStr} where id=${id}`
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            msg: '更新成功'
        }
    })
    ctx.body = response
}

var getAuthList =  async (ctx, next) => {
    let sql = `select *, id as 'key', id as 'value' from auth`
    
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            data: [],
            count: res.length
        }
        response.data = listToTree(res, 0)
    })
    ctx.body = response
}

var getAuthOne =  async (ctx, next) => {
    const postData = ctx.request.body
    const where = concatWhere(postData)
    let sql = `select * from auth ${where}`
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            data: {}
        }
        if(res.length === 1) {
            response.data = res[0]
        }
    })
    ctx.body = response
}

var delAuth = async (ctx, next) => {
    const { id } = ctx.request.body
    let sql = `delete from auth where id=${id}`
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            msg: '删除成功'
        }
    })
    ctx.body = response
}


module.exports = {
    'POST /privilege/addAuth': addAuth,
    'POST /privilege/updateAuth': updateAuth,
    'POST /privilege/getAuthList': getAuthList,
    'POST /privilege/delAuth': delAuth,
    'POST /privilege/getAuthOne': getAuthOne
};