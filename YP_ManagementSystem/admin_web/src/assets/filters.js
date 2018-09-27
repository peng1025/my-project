let formatDate = time => {
  if (time) {
    let timecomputed = time
      .replace("/Date(", "")
      .replace(")/", "")
      .split("+")[0];
    let da = new Date(timecomputed);
    return (
      da.getFullYear() +
      "-" +
      ("0" + (da.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + da.getDate()).slice(-2) +
      " " +
      ("0" + da.getHours()).slice(-2) +
      ":" +
      ("0" + da.getMinutes()).slice(-2) +
      ":" +
      ("0" + da.getSeconds()).slice(-2)
    );
  }
  return "";
}
let formatAccountType = (data) => {
  switch (data) {
    case 0:
      return "员工";
    case 1:
      return "管理员";
    default:
      return "";
  }
}
let formatStatus = (data) => {
  switch (data) {
    case 0:
      return "离职";
    case 1:
      return "在职";
    default:
      return "";
  }
}
let formatMenu = (data) => {
  switch (data) {
    case 0:
      return "模块";
    case 1:
      return "页面";
    case 2:
      return "功能";
    default:
      return "";
  }
}
let formatDelflag = (data) => {
  return data == 0 ? "有效" : "无效";
}
let formatSendState = (data) => {
  return data === 1 ? "成功" : "失败";
}
//预知识是否通过状态
let formApprovalState = (data) => {
  switch (data) {
    case 0:
      return "待审核";
    case 1:
      return "已通过";
    case 2:
      return "未通过";
    default:
      return "";
  }
}
export { formatDate, formatAccountType, formatStatus, formatMenu, formatDelflag, formatSendState, formApprovalState }