const query = require('../libs/mysql')
const { concatKeyValue, concatWhere, concatUpdate } = require('../util/tools')
const { getAllCheckAccess } = require('../util/common')

var addRole = async (ctx, next) => {
    const postData = ctx.request.body
    const {keys, values} = concatKeyValue(postData)
    // let {parentId, title, access} = ctx.request.body
    let sql = `insert into role (${keys.join(',')}) values (${values.join(',')})`
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            msg: '添加成功'
        }
    })
    ctx.body = response
}


var updateRole = async (ctx, next) => {
    const postData = ctx.request.body
    const id = postData.id
    delete postData.id
    const setStr = concatUpdate(postData)
    // let {parentId, title, access} = ctx.request.body
    let sql = `update role set ${setStr} where id=${id}`
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            msg: '更新成功'
        }
    })
    ctx.body = response
}


var getRoleList =  async (ctx, next) => {
    let sql = 'select * from role'
    
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            data: res,
            count: res.length
        }
    })
    ctx.body = response
}


var getRoleInfo =  async (ctx, next) => {
    const postData = ctx.request.body
    const where = concatWhere(postData)
    let sql = `select id, roleName, remark from role ${where}`
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

var getRoleAccess =  async (ctx, next) => {
    const {id} = ctx.request.body
    let sql = `select role.id, access from role where role.id='${id}';`
    let response = {}
    await query(sql).then(res => {
        if(res.length === 1) {
            response.code = 0
            response.data = res[0]
        }
    })
    if (response.data.access) {
        let treeData = []
        let sql2 = `select * from auth;`
        await query(sql2).then(res => {
            treeData = res
        })
        response.data.access = getAllCheckAccess(response.data.access.split(','), treeData)
    } else {
        response.data.access = []
    }
    ctx.body = response
}

// 设置角色权限
var setRoleAccess =  async (ctx, next) => {
    const { id, access } = ctx.request.body
    let sql = `update role set access='${access}' where role.id='${id}';`
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            msg: '保存成功'
        }
    })
    ctx.body = response
}

var delRole = async (ctx, next) => {
    const { id } = ctx.request.body
    let sql = `delete from role where id='${id}'`
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
    'POST /role/addrole': addRole,
    'POST /role/updaterole': updateRole,
    'POST /role/getRoleList': getRoleList,
    'POST /role/delRole': delRole,
    'POST /role/getRoleInfo': getRoleInfo,
    'POST /role/getRoleAccess': getRoleAccess,
    'POST /role/setRoleAccess': setRoleAccess
};