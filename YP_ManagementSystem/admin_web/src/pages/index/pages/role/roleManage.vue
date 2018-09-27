<template>
  <div class="border">
    <div style="padding:20px;background-color: #fff;">
      <el-button v-if="show['添加角色']" type="primary" @click="dialogFormVisible = true;roleDownPermissionData=[]">新增</el-button>
    </div>
    <div name='roleGrid' class="pd20">
      <my-table :tableFormat="tableFormat" :data="tableData" :options="options" :show="show" @deleteRoles="deleteRoles" @authorization="authorization" @roleCopy="roleCopy" @handleEdit="handleEdit"></my-table>
    </div>
    <div name='addForm'>
      <el-dialog title="新增/修改" :visible.sync="dialogFormVisible" @close="resetForm">
        <el-form :model="roleForm" ref="roleForm" :rules="rules">
          <el-form-item label="角色名称 " prop="name" :label-width="formLabelWidth">
            <el-input v-model="roleForm.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="角色描述 " prop="description" :label-width="formLabelWidth">
            <el-input type="textarea" v-model="roleForm.description" :rows="2" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false;resetForm()">取 消</el-button>
          <el-button type="primary" :loading="loadingBtnState.submitRoleState" @click="submitRoleForm()">确 定</el-button>
        </div>
      </el-dialog>
    </div>
    <div name='treeDialog'>
      <el-dialog title="授权" :visible.sync="dialogTreeVisible" width="30%">
        <el-tree ref="tree" :check-strictly="true" :data="permissionData" default-expand-all show-checkbox node-key="ID" :default-checked-keys="roleDownPermissionData" :props="defaultProps">
        </el-tree>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogTreeVisible = false;">取 消</el-button>
          <el-button type="primary" :loading="loadingBtnState.submitRolePermissionState" @click="submitRolePermissions()">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>

</template>
<script>
export default {
  data() {
    var me = this;
    var roleNameCheck = function(rule, value, callback) {
      if (me.roleList[value]) {
        callback(new Error("此角色已存在!!!"));
      } else {
        callback();
      }
    };

    return {
      tableFormat: [
        { prop: "Name", label: "角色名称", width: "200" },
        { prop: "Description", label: "角色描述" }
      ],
      options: {
        button: true,
        maxButtons: 4
      },
      roleData: [],
      roleList: {},
      roleDownPermissionData: [],
      permissionData: [],
      directoryPermissions: [],
      defaultProps: {
        children: "children",
        label: "Name"
      },
      roleForm: {
        id: 0,
        name: "",
        description: "",
        resourceIndex: ""
      },
      roleId: 0,
      dialogFormVisible: false,
      dialogTreeVisible: false,
      formLabelWidth: "120px",
      rules: {
        name: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 0,
            max: 30,
            message: "角色名称不要超过 30 个字符",
            trigger: "blur"
          },
          {
            validator: roleNameCheck
          }
        ],
        description: [
          {
            min: 0,
            max: 60,
            message: "角色描述不要超过 60 个字符",
            trigger: "blur"
          }
        ]
      },
      show: {
        角色权限: false,
        获取有效权限: false,
        编辑角色: false,
        添加角色: false,
        添加角色及授权: false,
        角色授权: false,
        删除角色: false,
        角色页角色列表: false
      },
      loadingBtnState: {
        submitRoleState: false,
        submitRolePermissionState: false
      }
    };
  },
  created() {
    this.init();
  },
  mounted() {
    this.ifshow(this.show);
  },
  methods: {
    //重置Form表单
    resetForm() {
      if (this.roleForm.id > 0 && this.roleForm.name.length > 0) {
        this.roleList[this.roleForm.name] = true;
      }
      this.$refs["roleForm"].resetFields();
      for (let key in this.roleForm) {
        this.roleForm[key] = "";
      }
    },
    //编辑按钮点击时
    handleEdit(row, index) {
      delete this.roleList[row.Name];
      this.roleForm.resourceIndex = index;
      this.roleForm.name = row.Name;
      this.roleForm.id = row.ID;
      this.roleForm.description = row.Description;
      this.dialogFormVisible = true;
    },
    roleCopy(row, index) {
      this.getRolePermissions(row.ID, "form");
    },
    authorization(row, index) {
      this.roleId = row.ID;
      this.getRolePermissions(row.ID, "Tree");
    },
    //递归组织树
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
    //获取角色下的权限
    getRolePermissions(roleId, type) {
      let me = this;
      me.ajax("角色权限", { id: roleId }, function(res, err) {
        if (res === null) {
          me.$message({
            message: err.msg,
            type: "error"
          });
        } else {
          me.roleDownPermissionData = res.data.map(item => {
            return item.ID;
          });
          if (type == "form") {
            me.dialogFormVisible = true;
          } else if (type == "Tree") {
            if (!me.permissionData.length > 0) {
              me.ajax("获取有效权限", {}, function(res, err) {
                if (res === null) {
                  me.$message({
                    message: err.msg,
                    type: "error"
                  });
                } else {
                  let data = {};
                  for (let i in res.data) {
                    data[i] = res.data[i];
                    me.directoryPermissions[res.data[i].ID] = res.data[i];
                  }
                  me.permissionData = me.formatPermissions(data, 0);
                  // me.roleDownPermissionData = me.reGetPermissions(
                  //   me.roleDownPermissionData
                  // );
                }
              });
            } else {
              me.$refs.tree.setCheckedKeys(
                me.roleDownPermissionData //me.reGetPermissions(me.roleDownPermissionData)
              );
            }
            me.dialogTreeVisible = true;
          }
        }
      });
    },
    submitRoleForm() {
      this.$refs["roleForm"].validate(valid => {
        var me = this;
        if (valid) {
          this.loadingBtnState.submitRoleState = true;
          if (me.roleForm.id > 0) {
            me.ajax("编辑角色", me.roleForm, function(res, err) {
              me.loadingBtnState.submitRoleState = false;
              if (res === null) {
                me.$message({
                  message: err.msg,
                  type: "error"
                });
              } else {
                me.roleData[me.roleForm.resourceIndex].Name = me.roleForm.name;
                me.roleData[me.roleForm.resourceIndex].Description =
                  me.roleForm.description;
                me.roleList[me.roleForm.name] = true;
                me.resetForm();

                me.$message({
                  type: "success",
                  message: "修改成功"
                });
                me.dialogFormVisible = false;
              }
            });
            //this.childPermissionData[this.permissionForm.resourceIndex].
          } else {
            let interfaceName =
              me.roleDownPermissionData.length > 0
                ? "添加角色及授权"
                : "添加角色";

            me.ajax(
              interfaceName,
              {
                name: me.roleForm.name,
                description: me.roleForm.description,
                permissions: me.roleDownPermissionData
              },
              function(res, err) {
                me.loadingBtnState.submitRoleState = false;
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
                  me.resetForm();
                  me.dialogFormVisible = false;
                  me.init();
                }
              }
            );
          }
        } else {
          return false;
        }
      });
    },
    //授权
    getPermissions() {
      let _this = this;
      let permissions = this.$refs.tree.getCheckedKeys();
      let ids = [];
      permissions.forEach(key => {
        getParentId(key);
      });
      function getParentId(id) {
        let node = _this.directoryPermissions[id];
        if (node.ParentID == 0) {
          return;
        } else {
          ids.push(node.ParentID);
          getParentId(node.ParentID);
        }
      }
      permissions = [...new Set([...permissions, ...ids])];
      return permissions;
    },
    //反选
    reGetPermissions(permissionsIds) {
      let _this = this;
      let ids = [];
      let fileIds = [];
      for (let i = 0; i < permissionsIds.length; i++) {
        for (let j = 0; j < permissionsIds.length; j++) {
          if (
            this.directoryPermissions[permissionsIds[i]].ID ===
            this.directoryPermissions[permissionsIds[j]].ParentID
          ) {
            fileIds.push(permissionsIds[i]);
            break;
          } else {
            ids.push(permissionsIds[i]);
          }
        }
      }
      ids = Array.from(
        new Set(
          ids.filter(item => {
            return !fileIds.includes(item);
          })
        )
      );
      return ids;
    },
    submitRolePermissions() {
      this.loadingBtnState.submitRolePermissionState = true;
      let permissionsIds = this.$refs.tree.getCheckedKeys(); //this.getPermissions();
      let me = this;
      me.ajax(
        "角色授权",
        { permissions: permissionsIds, id: me.roleId },
        function(res, err) {
          me.loadingBtnState.submitRolePermissionState = false;
          if (res === null) {
            me.$message({
              message: err.msg,
              type: "error"
            });
          } else {
            me.dialogTreeVisible = false;
            me.$message({
              message: "操作成功",
              type: "success"
            });
          }
        }
      );
    },
    deleteRoles(row, index) {
      this.$confirm("此操作将永久删除选中角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let me = this;
          me.ajax("删除角色", { id: row.ID }, function(res, err) {
            if (res === null) {
              me.$message({
                message: err.msg,
                type: "error"
              });
            } else {
              me.roleData.splice(index, 1);
              delete me.roleList[row.Name];
              me.$message({
                type: "success",
                message: "删除成功"
              });
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    init() {
      var me = this;
      this.ajax("角色页角色列表", {}, function(res, err) {
        if (res === null) {
          me.$message({
            message: err.msg,
            type: "error"
          });
        } else {
          me.roleData = res.data;
          for (let i in res.data) {
            me.roleList[res.data[i].Name] = true;
          }
        }
      });
    }
  },
  computed: {
    tableData: function() {
      let tempArr = [];
      for (let item of this.roleData) {
        let obj = { ...item };
        obj.buttons = [
          {
            show: "角色授权",
            type: "primary",
            icon: "el-icon-setting",
            title: "角色授权",
            fun: "authorization"
          },
          {
            show: "添加角色及授权",
            type: "success",
            icon: "el-icon-printer",
            title: "复制角色",
            fun: "roleCopy"
          },
          {
            show: "编辑角色",
            type: "warning",
            icon: "el-icon-edit",
            title: "编辑角色",
            fun: "handleEdit"
          },
          {
            show: "删除角色",
            type: "danger",
            icon: "el-icon-delete",
            title: "删除角色",
            fun: "deleteRoles"
          }
        ];
        tempArr.push(obj);
      }
      return tempArr;
    }
  }
};
</script>

