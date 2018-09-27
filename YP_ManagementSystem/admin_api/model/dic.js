module.exports = {
    //订单状态
    orderStatusModel: {
        1: "待发送",
        2: "待上传",
        3: "待审核",
        4: "审核不通过",
        9: "审核通过",
        0: "已关单"
    },
    //项目  id -> 名称
    projectntoc: {
        1: "联通",

    },
    //项目 名称 -> id
    projectcton: {
        "联通": 1
    },

    //员工状态：
    empType: {
        1: "入职",
        0: "离职"
    },
    //账号类型
    accountType: {
        0: "员工",
        1: "管理员"
    },

    //权限类型
    permissionType: {
        0: "模块",
        1: "页面",
        2: "功能"
    },


    //短信发送状态：
    smsStatus: {
        0: "失败",
        1: "成功"
    }
}