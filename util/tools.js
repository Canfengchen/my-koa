const { getTimeStamp } = require('../util/common')
module.exports = {
    mergeAndRequire: (requirement) => {
        // 与条件合并
        let str = ''
        for (let key in requirement) {
            if(requirement[key] !== '' && typeof requirement[key] !== 'undefined') {
                str += `${key}='${requirement[key]}' and `
            }
        }
        if (str.length > 0) {
            str = str.substr(0, str.length - 5)
        }
        return str
    },
    listToTree: (list, pid) => {
        list.forEach(item => {
            let parentId = item.id
            list.forEach(item2 => {
                if(parentId === item2.parentId) {
                    item.children = item.children || []
                    item.children.push(item2)
                }
            })
        })
        return list.filter(item => item.parentId === pid)
    },
    concatKeyValue: (data) => {
        let keys =  []
        let values = []
        for (let key in data) {
            keys.push(key)
            values.push(`'${data[key]}'`)
        }
        keys.push('createTime')
        values.push(getTimeStamp())
        return { keys, values }
    },
    concatWhere: (data) => {
        // 合并where条件
        let where = ''
        for (let key in data) {
            if (data[key]) {
                where += `${key}='${data[key]}' and `
            }
        }
        if(where.length > 0) {
            where = where.substr(0, where.length - 5)
            return 'where ' + where
        }
        return ''
    },
    concatUpdate: (data) => {
        // 合并更新条件
        let setStr = ''
        for (let key in data) {
            if (data[key] || typeof data[key] === 'number') {
                setStr += `${key}='${data[key]}', `
            }
        }
        if (setStr.length > 0) {
            setStr = setStr.substr(0, setStr.length - 2)
        }
        return setStr
    }
}