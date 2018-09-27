<template>
  <div>
    <el-row>
      <el-col :span="4" class="pd10">
        <span class="activeOrg">组织:{{activeOrg.name}}</span>
      </el-col>
      <el-col :span="8" class="pd10">
        <el-button v-if="show['添加组织']" type="success" icon="el-icon-plus" @click="addOrgBefore()">添加</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="pd10">
        <my-table :tableFormat="tableFormat" :data="tableData" :options="options" :show="show" @editOrg="editOrg" @removeOrg="removeOrg"></my-table>
      </el-col>
    </el-row>
    <el-dialog v-if="show['添加组织']" title="新增组织" :visible.sync="addFormVisible" @close="reset('form')">
      <el-form ref="form" :rules="rules" :model="form" label-width="80px">
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="上级组织" prop="parentid">
          <el-select v-model="form.parentid" placeholder="请选择上级组织" style="width:100%;">
            <el-option :key="org.ID" v-for="org in allOrgList" :label="org.Name" :value="org.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="默认角色" prop="roles">
          <el-select v-model="form.roles" placeholder="请选择默认角色" style="width:100%;" multiple>
            <el-option :key="role.ID" v-for="role in roleList" :label="role.Name" :value="role.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组织描述" prop="description">
          <el-input type="textarea" v-model="form.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFormVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loadingBtnState.addOrgState" @click="addOrg">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog v-if="show['编辑组织']" title="编辑组织" :visible.sync="editFormVisible" v-loading="defaultRoleLoading" @close="reset('editform')">
      <el-form ref="editform" :rules="rules" :model="editform" label-width="80px">
        <el-form-item label="上级组织" style="text-align:left;">
          <span>{{editpname}}</span>
        </el-form-item>
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="editform.name"></el-input>
        </el-form-item>
        <el-form-item label="默认角色" prop="roles">
          <el-select v-model="editform.roles" placeholder="请选择默认角色" style="width:100%;" multiple>
            <el-option :key="role.ID" v-for="role in roleList" :label="role.Name" :value="role.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组织描述" prop="description">
          <el-input type="textarea" v-model="editform.description"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">取 消</el-button>
        <el-button type="primary" :loading="loadingBtnState.editOrgState" @click="editOrgHandle">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: ["orgList", "activeOrg", "roleList", "allOrgList"],
  data() {
    return {
      addFormVisible: false,
      editFormVisible: false,
      defaultRoleLoading: false,
      tableFormat: [
        { prop: "Name", label: "名称", width: "150" },
        { prop: "Description", label: "描述" }
      ],
      options: {
        button: true,
        maxButtons: 2
      },
      form: {
        parentid: "",
        roles: [],
        name: "",
        description: ""
      },
      editform: {
        parentid: "",
        roles: [],
        oldroles: "",
        id: "",
        name: "",
        description: ""
      },
      editpname: "无",
      activeIndex: "",
      rules: {
        parentid: [
          { required: true, message: "请选择上级组织", trigger: "change" }
        ],
        name: [
          { required: true, message: "请输入组织名称", trigger: "blur" },
          { max: 30, message: "组织名称不要超过 30 个字符", trigger: "blur" }
        ],
        description: [
          { max: 60, message: "描述不要超过 60 个字符", trigger: "blur" }
        ]
      },
      show: {
        添加组织: false,
        编辑组织: false,
        删除组织: false
      },
      loadingBtnState: {
        addOrgState: false,
        editOrgState: false
      }
    };
  },
  created() {
    this.ifshow(this.show);
  },
  methods: {
    reload() {
      this.$emit("getOrgList");
      this.$emit("getOrgTree");
    },
    reset(formName) {
      this.$refs[formName].resetFields();
    },
    addOrgBefore() {
      this.form.parentid = this.activeOrg.id;
      this.addFormVisible = true;
    },
    addOrg() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.loadingBtnState.addOrgState = true;
          this.ajax("添加组织", this.form, this.addOrgCB);
        } else {
          return false;
        }
      });
    },
    addOrgCB(ret, err) {
      this.loadingBtnState.addOrgState = false;
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
    },
    editOrg(data, index) {
      this.defaultRoleLoading = true;
      let pname = "";
      for (let item of this.allOrgList) {
        if (item.ID === data.ParentID) pname = item.Name;
      }
      this.editpname = !!pname ? pname : "无";
      let flag = false;
      this.ajax("默认角色", { id: data.ID }, (ret, err) => {
        if (ret === null) {
          this.$message({
            message: err.msg,
            type: "error"
          });
        } else {
          flag = true;
          this.defaultRoleLoading = false;
          if (!!ret.data[0]) {
            let arr = ret.data[0].RoleIDs.split(",");
            for (let i in arr) {
              arr[i] = parseInt(arr[i]);
            }
            this.editform.oldroles = ret.data[0].RoleIDs;
            this.editform.roles = arr;
          } else {
            this.editform.oldroles = "";
            this.editform.roles = [];
          }
        }
      });
      if (flag) return;
      this.activeIndex = index;
      this.editform.parentid = data.ParentID;
      this.editform.id = data.ID;
      this.editform.name = data.Name;
      this.editform.description = data.Description;
      this.editFormVisible = true;
    },
    noChange() {
      let oldobj = this.orgList[this.activeIndex];
      let newobj = this.editform;
      if (
        oldobj.Description === newobj.description &&
        newobj.oldroles === newobj.roles.join(",") &&
        oldobj.Name === newobj.name &&
        oldobj.ID === newobj.id
      ) {
        this.reset("editform");
        this.activeIndex = "";
        this.editFormVisible = false;
        return true;
      }
      return false;
    },
    editOrgHandle() {
      this.$refs["editform"].validate(valid => {
        if (valid) {
          if (this.noChange()) return;
          this.loadingBtnState.editOrgState = true;
          this.ajax("编辑组织", this.editform, (ret, err) => {
            this.loadingBtnState.editOrgState = false;
            if (ret === null) {
              this.$message({
                message: err.msg,
                type: "error"
              });
            } else {
              this.editFormVisible = false;
              this.orgList[this.activeIndex].Name = this.editform.name;
              this.orgList[
                this.activeIndex
              ].Description = this.editform.description;
              this.reset("editform");
              this.activeIndex = "";
              this.$emit("getOrgTree");
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
    removeOrg(row, index) {
      this.$confirm("确定要删除组织吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.ajax("删除组织", { id: row.ID }, (ret, err) => {
            if (ret === null) {
              this.$message({
                message: err.msg,
                type: "error"
              });
            } else {
              this.orgList.splice(index, 1);
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              if (this.activeOrg.id === row.ID) {
                this.$emit("removeActiveOrg");
              } else {
                this.reload();
              }
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
      for (let item of this.orgList) {
        let obj = { ...item };
        obj.buttons = [
          {
            show: "编辑组织",
            type: "primary",
            icon: "el-icon-edit",
            title: "编辑",
            fun: "editOrg"
          },
          {
            show: "删除组织",
            type: "danger",
            icon: "el-icon-delete",
            title: "删除",
            fun: "removeOrg"
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
</style>