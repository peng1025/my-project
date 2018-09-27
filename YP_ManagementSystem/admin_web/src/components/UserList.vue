<template>
  <div>
    <el-row>
      <el-col :span="4" class="pd10">
        <span class="activeOrg">组织:{{activeOrg.name}}</span>
      </el-col>
      <el-col v-if="show['组织用户列表']" :span="20" class="pd10">
        <el-form :inline="true" :model="form" ref="form" class="demo-form-inline" label-width="70px">
          <el-form-item label="姓名" size="mini" prop="name">
            <el-input maxlength="20" v-model="form.name" placeholder="姓名"></el-input>
          </el-form-item>
          <el-form-item label="账号" size="mini" prop="username">
            <el-input maxlength="20" v-model="form.username" placeholder="账号"></el-input>
          </el-form-item>
          <el-form-item label="工号" size="mini" prop="jobno">
            <el-input maxlength="12" v-model="form.jobno" placeholder="工号"></el-input>
          </el-form-item>
          <el-form-item label="入职状态" size="mini" prop="status">
            <el-select v-model="form.status" placeholder="请选择">
              <el-option :key="sta.ID" v-for="sta in empType" :label="sta.Name" :value="sta.ID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="账号类型" size="mini" prop="ismanage">
            <el-select v-model="form.ismanage" placeholder="请选择">
              <el-option :key="manage.ID" v-for="manage in accountType" :label="manage.Name" :value="manage.ID"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loadingBtnState.searchState" @click="reload">查询</el-button>
            <el-button type="primary" @click="resetForm('form')" plain>重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="pd10">
        <el-button v-if="show['添加用户']" type="success" icon="el-icon-plus" @click="addBefore">添加</el-button>
        <el-button v-if="show['变更用户状态']" type="warning" icon="el-icon-edit" @click="changeStatusBefore" :disabled="!options.multipleSelection.length">状态变更</el-button>
        <el-button v-if="show['变更用户组织']" type="primary" icon="el-icon-edit" @click="changeOrgBefore" :disabled="!options.multipleSelection.length">组织变更</el-button>
        <el-button v-if="show['删除用户']" type="danger" icon="el-icon-delete" @click="removeUser" :disabled="!options.multipleSelection.length">删除</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="pd10">
        <my-table :tableFormat="tableFormat" :data="tableData" :options="options" :show="show" @editUser="editUser" @changeRoleBefore="changeRoleBefore" @removeUser="removeUser"></my-table>
        <el-pagination align="center" background @current-change="currentChange" :current-page="pageindex" :page-size="pagesize" layout="total, prev, pager, next" :total="userCount">
        </el-pagination>
      </el-col>
    </el-row>
    <el-dialog v-if="show['添加用户']" title="添加用户" :visible.sync="addFormVisible" :before-close="confirmClose" @close="resetForm('addform')">
      <el-form :model="addform" ref="addform" :rules="rules" label-width="80px">
        <el-form-item label="所属组织" prop="orgid">
          <el-select v-model="addform.orgid" placeholder="请选择所属组织" style="width:100%;">
            <el-option :key="org.ID" v-for="org in orgList" :label="org.Name" :value="org.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addform.name"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="username">
          <el-input v-model="addform.username"></el-input>
        </el-form-item>
        <el-form-item label="工号" prop="jobno">
          <el-input v-model="addform.jobno"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="addform.roles" multiple placeholder="请选择角色" style="width:100%;">
            <el-option :key="role.ID" v-for="role in roleList" :label="role.Name" :value="role.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入职状态" prop="status">
          <el-select v-model="addform.status" placeholder="请选择入职状态" style="width:100%;">
            <el-option :key="status.ID" v-for="status in empType" :label="status.Name" :value="status.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号类型" prop="type">
          <el-select v-model="addform.type" placeholder="请选择账号类型" style="width:100%;">
            <el-option :key="manage.ID" v-for="manage in accountType" :label="manage.Name" :value="manage.ID"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFormVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loadingBtnState.addState" @click="addUser">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="show['编辑用户']" title="编辑用户" :visible.sync="editFormVisible" @close="resetForm('editform')">
      <el-form :model="editform" ref="editform" :rules="rules" label-width="80px">
        <el-form-item label="账号" prop="username">
          <span>{{editform.username}}</span>
        </el-form-item>
        <el-form-item label="工号" prop="jobno">
          <span>{{editform.jobno}}</span>
        </el-form-item>
        <el-form-item label="所属组织" prop="orgid">
          <el-select v-model="editform.orgid" placeholder="请选择所属组织" style="width:100%;">
            <el-option :key="org.ID" v-for="org in orgList" :label="org.Name" :value="org.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editform.name"></el-input>
        </el-form-item>
        <el-form-item label="入职状态" prop="status">
          <el-select v-model="editform.status" placeholder="请选择入职状态" style="width:100%;">
            <el-option :key="status.ID" v-for="status in empType" :label="status.Name" :value="status.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账号类型" prop="type">
          <el-select v-model="editform.type" placeholder="请选择账号类型" style="width:100%;">
            <el-option :key="manage.ID" v-for="manage in accountType" :label="manage.Name" :value="manage.ID"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loadingBtnState.editState" @click="editUserHandle">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="show['变更用户状态']" title="状态变更" :visible.sync="statusFormVisible" @close="resetForm('statusform')">
      <el-form ref="statusform" :rules="rules" :model="statusform" label-width="80px">
        <el-form-item label="入职状态" prop="status">
          <el-select v-model="statusform.status" placeholder="请选择入职状态" style="width:100%;">
            <el-option :key="status.ID" v-for="status in empType" :label="status.Name" :value="status.ID"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="statusFormVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loadingBtnState.changeStatusState" @click="changeStatus">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="show['变更用户组织']" title="组织变更" :visible.sync="orgFormVisible" @close="resetForm('orgform')">
      <el-form ref="orgform" :rules="rules" :model="orgform" label-width="80px">
        <el-form-item label="所属组织" prop="orgid">
          <el-select v-model="orgform.orgid" placeholder="请选择所属组织" style="width:100%;">
            <el-option :key="org.ID" v-for="org in orgList" :label="org.Name" :value="org.ID"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="orgFormVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loadingBtnState.changeOrgState" @click="changeOrg">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="show['设置角色']" title="设置角色" :visible.sync="roleFormVisible" @close="resetForm('roleform')">
      <el-form ref="roleform" :rules="rules" :model="roleform" label-width="80px">
        <el-form-item label="姓名" style="text-align:left;">
          <span>{{roletext.name}}</span>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="roleform.roles" multiple placeholder="请选择角色" style="width:100%;">
            <el-option :key="role.ID" v-for="role in roleList" :label="role.Name" :value="role.ID"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="roleFormVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loadingBtnState.changeRoleState" @click="changeRole">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const fd = Vue.filter("formatDate");
const fa = Vue.filter("formatAccountType");
const fs = Vue.filter("formatStatus");
export default {
  props: [
    "userList",
    "userCount",
    "activeOrg",
    "orgList",
    "roleList",
    "defaultRole"
  ],
  data() {
    return {
      addFormVisible: false,
      orgFormVisible: false,
      editFormVisible: false,
      statusFormVisible: false,
      roleFormVisible: false,
      pageindex: 1,
      pagesize: 10,
      empType: [],
      accountType: [],
      form: {
        name: "",
        username: "",
        jobno: "",
        status: "",
        ismanage: ""
      },
      addform: {
        orgid: "",
        name: "",
        username: "",
        status: "",
        type: "",
        roles: [],
        jobno: ""
      },
      statusform: {
        status: "",
        uids: []
      },
      orgform: {
        orgid: "",
        uids: []
      },
      roleform: {
        id: "",
        roles: []
      },
      roletext: {
        name: ""
      },
      editform: {
        orgid: "",
        id: "",
        name: "",
        username: "",
        status: "",
        type: "",
        jobno: ""
      },
      activeIndex: "",
      rules: {
        orgid: [
          { required: true, message: "请选择所属组织", trigger: "change" }
        ],
        status: [
          { required: true, message: "请选择入职状态", trigger: "change" }
        ],
        type: [
          { required: true, message: "请选择账号类型", trigger: "change" }
        ],
        name: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (!/(^[\u4e00-\u9fa5]{1,19}$)/.test(value)) {
                callback(new Error("请输入2到20字符,中文!"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        username: [
          { required: true, message: "请输入账号", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (!/^[a-zA-z]\w{1,19}$/.test(value)) {
                callback(
                  new Error("请输入2到20字符,数字字母下划线,以字母开头!")
                );
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        jobno: [
          { required: true, message: "请输入工号", trigger: "blur" },
          { max: 12, message: "工号不要超过 12 个字符", trigger: "blur" }
        ]
      },
      show: {
        添加用户: false,
        编辑用户: false,
        删除用户: false,
        变更用户状态: false,
        变更用户组织: false,
        设置角色: false,
        组织用户列表: false
      },
      tableFormat: [
        { prop: "Name", label: "姓名", width: "150" },
        { prop: "UserName", label: "账号", width: "150" },
        { prop: "OrgIDStr", label: "组织", width: "150" },
        { prop: "JobNO", label: "工号", width: "150" },
        { prop: "RoleNames", label: "角色", width: "150" },
        { prop: "IsManageStr", label: "账号类型", width: "150" },
        { prop: "StatusStr", label: "入职状态", width: "150" },
        { prop: "CreateBy", label: "创建人", width: "150" },
        { prop: "CreateTimeStr", label: "创建时间", width: "180" },
        { prop: "UpdateBy", label: "修改人", width: "150" },
        { prop: "UpdateTimeStr", label: "修改时间", width: "180" },
        { prop: "LastLoginTimeStr", label: "最后登录时间", width: "180" }
      ],
      options: {
        selection: true,
        multipleSelection: [],
        multipleSelectionIndex: [],
        button: true,
        maxButtons: 3
      },
      loadingBtnState: {
        searchState: false,
        addState: false,
        editState: false,
        changeStatusState: false,
        changeOrgState: false,
        changeRoleState: false
      }
    };
  },
  created() {
    this.init();
  },
  mounted() {
    this.reload();
  },
  methods: {
    currentChange(val) {
      this.pageindex = val || 1;
      this.reload();
    },
    init() {
      this.ifshow(this.show);
      this.getDic("入职状态", ret => {
        this.empType = ret;
      });
      this.getDic("账号类型", ret => {
        this.accountType = ret;
      });
    },
    reload() {
      let start = (this.pageindex - 1) * this.pagesize;
      let obj = {};
      for (let key in this.form) {
        if (this.form[key] !== "") obj[key] = this.form[key];
      }
      this.$emit("searchUser", {
        start: start,
        size: this.pagesize,
        ...obj
      });
    },
    confirmClose(done) {
      this.$confirm("确定要关闭弹出框吗?")
        .then(() => {
          done();
        })
        .catch(_ => {});
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    addBefore() {
      this.addform.orgid = this.activeOrg.id;
      this.addform.roles = this.defaultRole;
      this.addFormVisible = true;
    },
    addUser() {
      this.$refs["addform"].validate(valid => {
        if (valid) {
          this.loadingBtnState.addState = true;
          this.ajax("添加用户", this.addform, (ret, err) => {
            this.loadingBtnState.addState = false;
            if (ret === null) {
              this.$message({
                message: err.msg,
                type: "error"
              });
            } else {
              this.addFormVisible = false;
              this.$message({
                type: "success",
                message: "添加成功!"
              });
              this.reload();
            }
          });
        } else {
          return false;
        }
      });
    },
    changeStatusBefore() {
      if (this.options.multipleSelection.length > 0) {
        this.statusform.uids = this.options.multipleSelection;
        this.statusFormVisible = true;
      } else {
        this.$message({
          type: "warning",
          message: "请选择要变更状态的用户!"
        });
        return;
      }
    },
    changeStatus() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.loadingBtnState.changeStatusState = true;
          this.ajax("变更用户状态", this.statusform, (ret, err) => {
            this.loadingBtnState.changeStatusState = false;
            if (ret === null) {
              this.$message({
                message: err.msg,
                type: "error"
              });
            } else {
              this.statusFormVisible = false;
              for (let i of this.options.multipleSelectionIndex) {
                this.userList[i].Status = this.statusform.status;
              }
              this.resetForm("statusform");
              this.$message({
                type: "success",
                message: "变更成功!"
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    changeRoleBefore(data, index) {
      this.roletext.name = data.Name;
      this.roleform.id = data.ID;
      let arr = [];
      for (let i of !!data.RoleIds ? data.RoleIds.split(",") : []) {
        arr.push(parseInt(i));
      }
      this.activeIndex = index;
      this.roleform.roles = arr;
      this.roleFormVisible = true;
    },
    changeRole() {
      this.loadingBtnState.changeRoleState = true;
      this.ajax("设置角色", this.roleform, (ret, err) => {
        this.loadingBtnState.changeRoleState = false;
        if (ret === null) {
          this.$message({
            message: err.msg,
            type: "error"
          });
        } else {
          this.roleFormVisible = false;
          let roleNameArr = [];
          for (let role of this.roleList) {
            for (let roleid of this.roleform.roles) {
              if (role.ID === roleid) {
                roleNameArr.push(role.Name);
              }
            }
          }
          this.userList[this.activeIndex].RoleIds = this.roleform.roles.join(
            ","
          );
          this.userList[this.activeIndex].RoleNames = roleNameArr.join(",");
          this.activeIndex = "";
          this.resetForm("roleform");
          this.$message({
            type: "success",
            message: "设置成功!"
          });
        }
      });
    },
    changeOrgBefore() {
      if (this.options.multipleSelection.length > 0) {
        this.orgform.uids = this.options.multipleSelection;
        this.orgFormVisible = true;
      } else {
        this.$message({
          type: "warning",
          message: "请选择要变更组织的用户!"
        });
        return;
      }
    },
    changeOrg() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.loadingBtnState.changeOrgState = true;
          this.ajax("变更用户组织", this.orgform, (ret, err) => {
            this.loadingBtnState.changeOrgState = false;
            if (ret === null) {
              this.$message({
                message: err.msg,
                type: "error"
              });
            } else {
              this.orgFormVisible = false;
              let orgname = "";
              for (let org of this.orgList) {
                if (org.ID === this.orgform.orgid) {
                  orgname = org.Name;
                }
              }
              for (let i of this.options.multipleSelectionIndex) {
                this.userList[i].OrgID = this.orgform.orgid;
                this.userList[i].OrgName = orgname;
              }
              this.resetForm("orgform");
              this.$message({
                type: "success",
                message: "变更成功!"
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    editUser(data, index) {
      this.activeIndex = index;
      this.editform.orgid = data.OrgID;
      this.editform.id = data.ID;
      this.editform.name = data.Name;
      this.editform.username = data.UserName;
      this.editform.status = data.Status;
      this.editform.type = data.IsManage;
      this.editform.jobno = data.JobNO;
      this.editFormVisible = true;
    },
    noChange() {
      let oldobj = this.userList[this.activeIndex];
      let newobj = this.editform;
      if (
        oldobj.OrgID === newobj.orgid &&
        oldobj.Status === newobj.status &&
        oldobj.Name === newobj.name &&
        oldobj.UserName === newobj.username &&
        oldobj.IsManage === newobj.type &&
        oldobj.JobNO === newobj.jobno &&
        oldobj.ID === newobj.id
      ) {
        this.resetForm("editform");
        this.activeIndex = "";
        this.editFormVisible = false;
        return true;
      }
      return false;
    },
    editUserHandle() {
      this.$refs["editform"].validate(valid => {
        if (valid) {
          if (this.noChange()) return;
          this.loadingBtnState.editState = true;
          this.ajax("编辑用户", this.editform, (ret, err) => {
            this.loadingBtnState.editState = false;
            if (ret === null) {
              this.$message({
                message: err.msg,
                type: "error"
              });
            } else {
              this.editFormVisible = false;
              this.userList[this.activeIndex].Name = this.editform.name;
              this.userList[this.activeIndex].Status = this.editform.status;
              this.userList[this.activeIndex].IsManage = this.editform.type;
              this.userList[this.activeIndex].OrgID = this.editform.orgid;
              this.resetForm("editform");
              this.activeIndex = "";
              this.$message({
                type: "success",
                message: "修改成功!"
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    orgFormat(OrgID) {
      for (let item of this.orgList) {
        if (item.ID === OrgID) return item.Name;
      }
    },
    removeUser(row, index) {
      let data = { ids: [] };
      let deleteCount = 0;
      if (!!index || index === 0) {
        deleteCount = 1;
        data.ids.push(row.ID);
      } else if (this.options.multipleSelection.length > 0) {
        deleteCount = this.options.multipleSelection.length;
        data.ids = this.options.multipleSelection;
      } else {
        this.$message({
          type: "warning",
          message: "请选择要删除的用户!"
        });
        return;
      }
      this.$confirm("确定要删除用户吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.ajax("删除用户", data, (ret, err) => {
            if (ret === null) {
              this.$message({
                message: err.msg,
                type: "error"
              });
            } else {
              if (
                this.userList.length - deleteCount <= 0 &&
                this.pageindex > 1
              ) {
                this.pageindex--;
              }
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              this.reload();
            }
          });
        })
        .catch(err => {
          if (err !== "cancel") {
            this.$message({
              type: "error",
              message: "系统错误,请联系管理员!" + err
            });
          }
        });
    }
  },
  computed: {
    tableData: function() {
      let tempArr = [];
      for (let item of this.userList) {
        let obj = { ...item };
        obj.OrgIDStr = this.orgFormat(obj.OrgID);
        obj.CreateTimeStr = fd(obj.CreateTime);
        obj.UpdateTimeStr = fd(obj.UpdateTime);
        obj.LastLoginTimeStr = fd(obj.LastLoginTime);
        obj.IsManageStr = fa(obj.IsManage);
        obj.StatusStr = fs(obj.Status);
        obj.buttons = [
          {
            show: "编辑用户",
            type: "primary",
            icon: "el-icon-edit",
            title: "编辑",
            fun: "editUser"
          },
          {
            show: "设置角色",
            type: "warning",
            icon: "el-icon-setting",
            title: "设置角色",
            fun: "changeRoleBefore"
          },
          {
            show: "删除用户",
            type: "danger",
            icon: "el-icon-delete",
            title: "删除",
            fun: "removeUser"
          }
        ];
        tempArr.push(obj);
      }
      return tempArr;
    }
  }
};
</script>

<style lang="less" scoped>
.activeOrg {
  line-height: 40px;
}
.demo-form-inline {
  .el-select,
  .el-input {
    width: 150px;
  }
}
</style>