<template>
  <div>
    <el-row>
      <el-col :span="5" style="50px">
        <div style="height:100%;background-color:#fff;padding:20px 0 20px 20px" class="border">
          <el-tree v-if="show['当前权限及其子权限列表']" :data="permissionData" default-expand-all :props="defaultProps" accordion @node-click="handleNodeClick" :expand-on-click-node="false"></el-tree>
        </div>
      </el-col>
      <el-col :span="19" style="border-left:1px solid #eee">
        <div class="border" >
          <div style="margin-left:5px;background-color:#fff;height:100%;text-align:left">
            <div style="padding:20px;background-color: #fff;">
              <el-button v-if="show['添加权限']" :disabled="checkTree.ID===undefined" type="primary" @click="beforHandAddBtn">新增</el-button>
              <!-- <el-button type="danger" @click="deletePermissions" :disabled="this.buttonState.btn">删除</el-button> -->
            </div>
            <div class="pd20">
              <my-table :tableFormat="tableFormat" :data="tableData" :options="options" :show="show" @handleEdit="handleEdit" @enablePermissions="enablePermissions" @disablePermissions="disablePermissions" @deletePermissions="deletePermissions">
              </my-table>
              <el-pagination align="center" background @current-change="currentChange" :current-page="pageindex" :page-size="pagesize" layout="total, prev, pager, next" :total="permissionsTotal">
              </el-pagination>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-dialog title="新增/修改" :visible.sync="dialogFormVisible" @close="resetForm">
      <el-form :model="permissionForm" ref="permissionForm" :rules="rules">
        <el-form-item label="权限名称 " prop="name" :label-width="formLabelWidth">
          <el-input v-model="permissionForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="权限类型" prop="type" :label-width="formLabelWidth">
          <el-select v-model="permissionForm.type" :disabled="permissionFormChildState.permissionTypeState" @change="typeChange">
            <el-option :key="type.ID" v-for="type in permissionType" :label="type.Name" :value="type.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="路径 " prop="url" :label-width="formLabelWidth">
          <el-input v-model="permissionForm.url" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="上级权限" prop="parentid" :label-width="formLabelWidth">
          <el-select v-model="permissionForm.parentid" placeholder="---请选择---">
            <el-option v-for="item in filePermissionSelectData" :key="item.ID" :label="item.Name" :value="item.ID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限描述 " prop="description" :label-width="formLabelWidth">
          <el-input type="textarea" v-model="permissionForm.description" :rows="2" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false;resetForm()">取 消</el-button>
        <el-button type="primary" :loading="loadingBtnState.submitPermissionState" @click="submitPermission()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
const fm = Vue.filter("formatMenu");
const fd = Vue.filter("formatDelflag");
export default {
  data() {
    var me = this;
    var permissionNameCheck = function(rule, value, callback) {
      // for (var i = 0; i < me.permissionData.length; i++) {
      //   if (me.permissionData[i].Name === me.checkTree.Name) {
      for (let i = 0; i < me.childPermissionData.length; i++) {
        if (
          me.childPermissionData[i].Name === value &&
          me.childPermissionData[i].ParentID == me.checkTree.ID
        ) {
          callback(new Error("当前权限下已存在此名称！！！"));
          break;
        }
        //   }
        // }
      }
      callback();
    };
    return {
      tableFormat: [
        { prop: "Name", label: "权限名称" },
        { prop: "Description", label: "权限描述" },
        { prop: "Url", label: "路径" },
        { prop: "ParentName", label: "上级权限" },
        { prop: "TypeStr", label: "权限类型" },
        { prop: "DeflagStr", label: "权限状态" }
      ],
      options: {
        button: true,
        maxButtons: 3
      },
      permissionData: [],
      childPermissionData: [],
      permissionSelectData: [],
      filePermissionSelectData: [],
      pageindex: 1,
      pagesize: 10,
      permissionsTotal: 0,
      permissionType: [],
      defaultProps: {
        children: "children",
        label: "Name"
      },
      permissionFormChildState: {
        permissionTypeState: false
      },
      //rootId: 0,
      checkTree: {},
      dialogFormVisible: false,
      permissionForm: {
        id: 0,
        parentid: "",
        name: "",
        url: "",
        description: "",
        type: "",
        resourceIndex: 0
      },
      rules: {
        name: [
          { required: true, message: "请输入权限名称", trigger: "blur" },
          {
            min: 0,
            max: 30,
            message: "权限名称不要超过 30 个字符",
            trigger: "blur"
          }
        ],
        type: [
          { required: true, message: "请选择权限类型", trigger: "change" }
        ],
        url: [
          { required: true, message: "请输入路径", trigger: "blur" },
          {
            min: 0,
            max: 100,
            message: "路径不要超过 100 个字符",
            trigger: "blur"
          }
        ],
        parentid: [
          { required: true, message: "请选择上级权限", trigger: "change" }
        ],
        description: [
          {
            min: 0,
            max: 60,
            message: "描述不要超过 60 个字符",
            trigger: "blur"
          }
        ]
      },
      formLabelWidth: "120px",
      show: {
        当前权限及其子权限列表: false,
        权限生效及失效: false,
        权限列表: false,
        添加权限: false,
        编辑权限: false,
        删除权限: false
      },
      loadingBtnState: {
        submitPermissionState: false
      }
    };
  },
  computed: {
    tableData: function() {
      let tempArr = [];
      for (let item of this.childPermissionData) {
        let obj = { ...item };
        obj.DeflagStr = fd(obj.Deflag);
        obj.TypeStr = fm(obj.Type);
        switch (obj.Deflag) {
          case 1:
            obj.buttons = [
              {
                show: "编辑权限",
                type: "primary",
                icon: "el-icon-edit",
                title: "编辑",
                fun: "handleEdit"
              },
              {
                show: "权限生效及失效",
                type: "success",
                icon: "el-icon-circle-check-outline",
                title: "生效",
                fun: "enablePermissions"
              },
              {
                show: "删除权限",
                type: "danger",
                icon: "el-icon-delete",
                title: "删除",
                fun: "deletePermissions"
              }
            ];
            break;
          case 0:
            obj.buttons = [
              {
                show: "编辑权限",
                type: "primary",
                icon: "el-icon-edit",
                title: "编辑",
                fun: "handleEdit"
              },
              {
                show: "权限生效及失效",
                type: "warning",
                icon: "el-icon-circle-close-outline",
                title: "失效",
                fun: "disablePermissions"
              },
              {
                show: "删除权限",
                type: "danger",
                icon: "el-icon-delete",
                title: "删除",
                fun: "deletePermissions"
              }
            ];
            break;
        }
        tempArr.push(obj);
      }
      return tempArr;
    }
  },
  created() {
    this.createdinit();
  },
  methods: {
    createdinit() {
      this.ifshow(this.show);
      this.getDic("权限类型", ret => {
        this.permissionType = ret;
      });
    },
    currentChange(val) {
      this.pageindex = val || 1;
      this.reload();
    },
    reload() {
      this.getChildPermissions(
        this.checkTree.ID,
        (this.pageindex - 1) * this.pagesize,
        this.pagesize
      );
    },
    resetForm() {
      this.$refs["permissionForm"].resetFields();
      for (let key in this.permissionForm) {
        this.permissionForm[key] = "";
      }
    },
    typeChange: function(value) {
      this.permissionForm.parentid = "";
      this.permissionForm.url = "";
      switch (value) {
        case 0:
          this.filePermissionSelectData = this.permissionSelectData.filter(
            function(val) {
              return val.ParentID === 0;
            }
          );
          break;
        case 1:
          this.filePermissionSelectData = this.permissionSelectData.filter(
            function(val) {
              return val.Type == 0 && val.ParentID !== 0;
            }
          );
          break;
        case 2:
          this.filePermissionSelectData = this.permissionSelectData.filter(
            function(val) {
              return val.Type == 1;
            }
          );
          break;
        default:
          break;
      }
    },
    beforHandAddBtn() {
      this.dialogFormVisible = true;
      this.permissionFormChildState.permissionTypeState = false;
      // if (this.checkTree.ParentID === 0) {
      //   this.typeChange(this.checkTree.Type.toString());
      //   this.permissionForm.parentid = this.checkTree.ID;
      // } else if (this.checkTree.ParentID === 1) {
      //   this.typeChange((this.checkTree.Type + 1).toString());
      //   this.permissionForm.parentid = this.checkTree.ID;
      // }
      //this.permissionForm.parentid = this.checkTree.ID;
    },
    handleNodeClick(data) {
      this.checkTree = data;
      this.pageindex = 1;
      this.reload();
    },
    getChildPermissions(parentId, pageindex, pagesize) {
      let me = this;
      me.ajax(
        "当前权限及其子权限列表",
        { id: parentId, start: pageindex, size: pagesize },
        function(res, err) {
          if (res === null) {
            me.$message({
              message: err.msg,
              type: "error"
            });
          } else {
            me.childPermissionData = res.data.result;
            me.permissionsTotal = res.data.count;
          }
        }
      );
    },
    handleEdit(row, index) {
      this.permissionFormChildState.permissionTypeState = true;
      this.permissionForm.id = row.ID;
      this.permissionForm.name = row.Name;
      this.permissionForm.type = row.Type;
      this.permissionForm.resourceIndex = index;
      this.permissionForm.description = row.Description;
      this.typeChange(row.Type);
      this.permissionForm.url = row.Url;
      this.permissionForm.parentid = row.ParentID;
      this.dialogFormVisible = true;
    },
    enablePermissions(row, index) {
      if (row.Deflag == 1) {
        this.stateChange(0, row.ID, index);
      }
    },
    stateChange(state, ID, index) {
      var me = this;
      if (ID < 0) {
        this.$message({
          message: "未选中数据",
          type: "warning"
        });
        return;
      }
      this.ajax("权限生效及失效", { deflag: state, id: ID }, function(
        res,
        err
      ) {
        if (res === null) {
          me.$message({
            message: err.msg,
            type: "error"
          });
        } else {
          me.$message({
            message: "操作成功",
            type: "success"
          });
          me.getChildPermissions(
            me.checkTree.ID,
            (me.pageindex - 1) * me.pagesize,
            me.pagesize
          );
        }
      });
    },
    disablePermissions(row, index) {
      if (row.Deflag === 1) {
        return;
      }
      this.$confirm(
        "此操作将失效当前权限下的所有子权限，所有角色将无法访问失效的权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this.stateChange(1, row.ID, index);
        })
        .catch(err => {
          if (err !== "cancel") {
            this.$message({
              type: "error",
              message: "系统错误,请联系管理员!" + err
            });
          }
        });
    },
    deletePermissions(row, index) {
      this.$confirm("此操作将永久删除此权限,不可恢复, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let me = this;
          me.ajax("删除权限", { id: row.ID }, function(res, err) {
            if (res === null) {
              me.$message({
                message: err.msg,
                type: "error"
              });
            } else {
              if (
                me.pageindex > 1 &&
                me.permissionsTotal - (me.pageindex - 1) * me.pagesize === 1
              ) {
                me.pageindex--;
              }
              me.init();
              me.getChildPermissions(
                me.checkTree.ID == row.ID ? row.ParentID : me.checkTree.ID,
                (me.pageindex - 1) * me.pagesize,
                me.pagesize
              );
              // me.childPermissionData.splice(index, 1);
              // me.permissionsTotal = me.permissionsTotal - 1;
              me.$message({
                type: "success",
                message: "删除成功"
              });
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
    },
    submitPermission() {
      this.$refs["permissionForm"].validate(valid => {
        var me = this;
        if (valid) {
          this.loadingBtnState.submitPermissionState = true;
          if (me.permissionForm.id > 0) {
            me.ajax("编辑权限", me.permissionForm, function(res, err) {
              me.loadingBtnState.submitPermissionState = false;
              if (res === null) {
                me.$message({
                  message: err.msg,
                  type: "error"
                });
              } else {
                me.childPermissionData[me.permissionForm.resourceIndex].Name =
                  me.permissionForm.name;
                me.childPermissionData[
                  me.permissionForm.resourceIndex
                ].Description =
                  me.permissionForm.description;
                me.childPermissionData[me.permissionForm.resourceIndex].Url =
                  me.permissionForm.url;
                me.childPermissionData[
                  me.permissionForm.resourceIndex
                ].ParentName = me.filePermissionSelectData.find(
                  item => item.ID === me.permissionForm.parentid
                )["Name"];
                me.childPermissionData[
                  me.permissionForm.resourceIndex
                ].ParentID = parseInt(me.permissionForm.parentid);
                //me.resetForm();
                me.init();
                me.$message({
                  type: "success",
                  message: "修改成功"
                });
                me.dialogFormVisible = false;
              }
            });
            //this.childPermissionData[this.permissionForm.resourceIndex].
          } else {
            me.ajax("添加权限", me.permissionForm, function(res, err) {
              me.loadingBtnState.submitPermissionState = false;
              if (res === null) {
                me.$message({
                  message: err.msg,
                  type: "error"
                });
              } else {
                me.$message({
                  type: "success",
                  message: "添加成功"
                });
                me.dialogFormVisible = false;
                me.init();
                me.pageindex = 0;
                me.getChildPermissions(
                  me.permissionForm.parentid,
                  (me.pageindex - 1) * me.pagesize,
                  me.pagesize
                );
                // me.resetForm();
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    formatPermissions(data, id) {
      let arr = [];
      for (let i in data) {
        if (data[i].ParentID === id) {
          arr.push(data[i]);
          delete data[i];
          arr[arr.length - 1].children = this.formatPermissions(
            data,
            arr[arr.length - 1].ID
          );
        }
      }
      return arr;
    },
    init() {
      var me = this;
      me.ajax("权限列表", {}, function(res, err) {
        if (res === null) {
          me.$message({
            message: err.msg,
            type: "error"
          });
        } else {
          me.permissionSelectData = res.data;
          let data = {};
          for (let i in res.data) {
            data[i] = res.data[i];
            // ///拿到根节点ID，目的在新增时反选上级权限使用（beforHandAddBtn方法）
            // if (res.data[i].ParentID === 0) {
            //   me.rootId = res.data[i].ID;
            // }
          }
          me.permissionData = me.formatPermissions(data, 0);
        }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style scoped>
.el-select {
  width: 100%;
}
.el-tree {
  width: 100%;
  overflow-x: auto;
}
/* .el-tree > .el-tree-node {
  display: inline-block;
  min-width: 100%;
} */
</style>