const query = require('../libs/mysql')
const md5 = require('md5')
const { makeToken, parseToken } = require('../util/common')
const { mergeAndRequire, concatKeyValue, concatUpdate } = require('../util/tools')

var login = async (ctx, next) => {
    let {userName, password} = ctx.request.body
    password = md5(password)
    let sql = `select users.* from users where userName='${userName}' and status=1;`
    let response = {}
    await query(sql).then(res => {
        if (res.length === 0) {
            response = {
                code: 1,
                msg: '用户不存在'
            }
        } else if (res[0].password !== password) {
            response = {
                code: 1,
                msg: '密码错误'
            }
        } else {
            // 帐号密码正确  创建token   
            //payload中写入一些值  time:创建日期  timeout：多长时间后过期
            let payload = {userName:userName, time:new Date().getTime(), timeout:1000*60*60*2}
            let token = makeToken(payload);
            let data = {
                ...res[0],
                token
            }
            delete data.password
            response = {
                code: 0,
                data: data
            }
        }  
    })
    if (response.code === 0) {
        let sql2 = `select role.roleName as roleName, GROUP_CONCAT(auth.access) access from role left join users on role.id=users.roleId left join auth on FIND_IN_SET(auth.id, role.access) > 0 where userName='${userName}' GROUP BY role.id;`
        
        await query(sql2).then(res => {
            if (res.length > 0) {
                response.data.access = res[0].access
                response.data.roleName = res[0].roleName
            }
        })
    }
    ctx.body = response
}

var getUserInfo =  async (ctx, next) => {
    const { token } = ctx.request.body
    const { userName } = await parseToken(token)
    let sql = `select users.* from users where userName='${userName}';`
    let response = {}
    await query(sql).then(res => {
        if (res.length === 0) {
            response = {
                code: 1002,
                msg: '用户不存在'
            }
        }else {
            // 帐号密码正确  创建token   
            //payload中写入一些值  time:创建日期  timeout：多长时间后过期
            let payload = {userName:userName, time:new Date().getTime(), timeout:1000*60*60*2}
            let token = makeToken(payload);
            let data = {
                ...res[0],
                token
            }
            delete data.password
            response = {
                code: 0,
                data: data
            }
    
        }
    })
    if (response.code === 0) {
        let sql2 = `select role.roleName as roleName, GROUP_CONCAT(auth.access) access from role left join users on role.id=users.roleId left join auth on FIND_IN_SET(auth.id, role.access) > 0 where userName='${userName}' GROUP BY role.id;`
        await query(sql2).then(res => {
            if (res.length > 0) {
                response.data.access = res[0].access
                response.data.roleName = res[0].roleName
            }
        })
    }
    ctx.body = response
}

var getUserList =  async (ctx, next) => {
    const { page, limit, userName, name, roleId, status } = ctx.request.body
    let sql = `select users.*, role.roleName roleName from users left join role on role.id=users.roleId `
    let requireStr = mergeAndRequire({userName, name, roleId, status})
    if (requireStr) {
        sql += `where ${requireStr} `
    }
    sql += `limit ${(page - 1) * limit }, ${limit};`
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            data: [],
            count: res.length
        }
        for (let index in res) {
            let data = res[index]
            delete data.password
            response.data.push(data)
        }
    })
    ctx.body = response
}

var getUserOne =  async (ctx, next) => {
    const { id } = ctx.request.body
    let sql = `select id, userName, phone, position, name, roleId from users where id=${id}`
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            data: res[0]
        }
    })
    ctx.body = response
}

var addUser = async (ctx, next) => {
    const { userName } = ctx.request.body
    let response = {}
    if (hasSameUserName(userName)) {
        response = {
            code: -1,
            msg: '账号已存在'
        }
    } else {
        const postData = ctx.request.body
        const {keys, values} = concatKeyValue(postData)
        // 默认生成密码123456
        let password = md5('123456')
        keys.push('password')
        values.push(`'${password}'`)
        // let {parentId, title, access} = ctx.request.body
        let sql = `insert into users (${keys.join(',')}) values (${values.join(',')})`
        await query(sql).then(res => {
            response = {
                code: 0,
                msg: '添加成功'
            }
        })
    }
    ctx.body = response
}

var updateUser = async (ctx, next) => {
    const { userName, id } = ctx.request.body
    let response = {}
    if (userName && hasSameUserName(userName, id)) {
        response = {
            code: -1,
            msg: '账号已存在'
        }
    } else {
        const postData = ctx.request.body
        const id = postData.id
        delete postData.id
        const setStr = concatUpdate(postData)
        let sql = `update users set ${setStr} where id=${id}`
        await query(sql).then(res => {
            response = {
                code: 0,
                msg: '更新成功'
            }
        })
    }
    ctx.body = response
}

var delUser = async (ctx, next) => {
    const { id } = ctx.request.body
    let sql = `delete from users where id=${id}`
    let response = {}
    await query(sql).then(res => {
        response = {
            code: 0,
            msg: '删除成功'
        }
    })
    ctx.body = response
}

var hasSameUserName = async (userName, id) => {
    // 查看是否已存在userName
    let result = false
    let sql = `select id from users where userName='${userName}'`
    await query(sql).then(res => {
        if (res.length > 0 && !(id && res[0].id === id)) {
            result = true
        }
    })
    return result
}



module.exports = {
    'POST /user/login': login,
    'POST /user/getUserInfo': getUserInfo,
    'POST /user/getUserList': getUserList,
    'POST /user/addUser': addUser,
    'POST /user/updateUser': updateUser,
    'POST /user/getUserOne': getUserOne,
    'POST /user/delUser': delUser,
};