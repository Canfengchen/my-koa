const Promise = require("bluebird");
const jwt = require("jsonwebtoken");
const verify = Promise.promisify(jwt.verify);
let secret = require("./secret");
module.exports = {
    parseToken: (token) => {
        return verify(token, secret);
    },
    makeToken: (payload) => {
        let token = jwt.sign(payload, secret);
        return token;
    },
    getTimeStamp: () => {
        // 获取此刻时间戳
        return Math.floor(new Date().getTime()/1000)
    },
    getAllCheckAccess: (accessList, treeData) => {
        let AllCheckAccess = []
        for (let i in treeData) {
            if (accessList.includes(String(treeData[i].id))) {
                let flag = true
                for (let j in treeData) {
                    if (treeData[j].parentId === treeData[i].id && !accessList.includes(treeData[j].id)) {
                        flag = false
                        break
                    }
                }
                if (flag) {
                    AllCheckAccess.push(treeData[i].id)
                }
            }
        }
        return AllCheckAccess
    }
      
}