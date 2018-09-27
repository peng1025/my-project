<template>
  <el-row>
    <el-col style="position:relative;min-height:40px;" class="border tree" id="tree">
      <el-button style="float:right;position:absolute;right:10px;z-index:1;" type="text" @click="iscollapse" :icon="collapse.icon"></el-button>
      <el-collapse-transition>
        <org-tree v-show="collapse.status" @getList="getList" :orgTree="orgTree" :defaultProps="defaultProps" v-loading="treeloading"></org-tree>
      </el-collapse-transition>
    </el-col>
    <el-col class="border table-list" id="table-list">
      <el-tabs type="card" style="border-left:1px solid #eee" :value="tab" @tab-click="settab">
        <el-tab-pane label="组织列表" name="1">
          <org-list v-if="show['组织列表']" @getOrgList="getOrgList" @getOrgTree="getOrgTree" @removeActiveOrg="removeActiveOrg" :roleList="roleList" :activeOrg="activeOrg" :orgList="orgList" :allOrgList="allOrgList" v-loading="orgListLoading"></org-list>
        </el-tab-pane>
        <el-tab-pane label="用户列表" name="2">
          <user-list v-if="show['组织用户列表']" @searchUser="searchUser" :roleList="roleList" :activeOrg="activeOrg" :userList="userList" :defaultRole="defaultRole" :userCount="userCount" :orgList="allOrgList"  @orgFormat="orgFormat" v-loading="userListLoading" ref="userList"></user-list>
        </el-tab-pane>
        <!-- <el-tab-pane label="用户信息管理" name="3"><user-info-list></user-info-list></el-tab-pane> -->
      </el-tabs>
    </el-col>
  </el-row>
</template>

<script>
import orgTree from "../../../../components/OrgTree";
import orgList from "../../../../components/OrgList";
import userList from "../../../../components/UserList";
import userInfoList from "../../../../components/UserInfoList";

export default {
  components: {
    orgTree,
    orgList,
    userList,
    userInfoList
  },
  data() {
    return {
      treeloading: false,
      orgListLoading: false,
      userListLoading: false,
      userInfoListLoading: false,
      collapse: {
        status: true,
        icon: "el-icon-d-arrow-left"
      },
      tab: "1",
      topOrg: {},
      activeOrg: {},
      userForm: {},
      orgTree: [],
      orgList: [],
      allOrgList: [],
      userList: [],
      userCount: 0,
      roleList: [],
      defaultRole: [],
      defaultProps: {
        children: "children",
        label: "Name"
      },
      show: {
        组织列表: false,
        组织用户列表: false
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.topOrg = this.storage.get("userOrg");
      this.getOrgTree();
      this.getList();
      this.getRoleList();
      //获取页面权限
      this.ifshow(this.show);
    },
    iscollapse() {
      let tree = document.getElementById("tree");
      let list = document.getElementById("table-list");
      tree.style.width = tree.style.width === "3%" ? "20%" : "3%";
      list.style.width = list.style.width === "97%" ? "80%" : "97%";
      this.collapse.status = !this.collapse.status;
      this.collapse.icon =
        this.collapse.icon === "el-icon-d-arrow-left"
          ? "el-icon-d-arrow-right"
          : "el-icon-d-arrow-left";
    },
    settab(t) {
      this.tab = t.name;
      this.getList(this.activeOrg);
    },
    getRoleList() {
      this.ajax("角色列表", {}, (ret, err) => {
        if (ret === null) {
          this.$message({
            message: err.msg,
            type: "error"
          });
        } else {
          this.roleList = ret.data;
        }
      });
    },
    getOrgTree() {
      this.treeloading = true;
      this.ajax(
        "组织列表",
        { organizationid: this.topOrg.id },
        this.getOrgTreeCB
      );
    },
    getOrgTreeCB(ret, err) {
      this.treeloading = false;
      if (ret === null) {
        this.$message({
          message: err.msg,
          type: "error"
        });
      } else {
        this.allOrgList = ret.data;
        let data = {};
        for (let i in ret.data) {
          data[i] = ret.data[i];
        }
        this.orgTree = this.formatOrgs(data, this.topOrg.pid);
      }
    },
    formatOrgs(data, id) {
      let arr = [];
      for (let i in data) {
        if (data[i].ParentID === id) {
          arr.push(data[i]);
          delete data[i];
          arr[arr.length - 1].children = this.formatOrgs(
            data,
            arr[arr.length - 1].ID
          );
        }
      }
      return arr;
    },
    getList(org) {
      this.activeOrg = org || this.topOrg;
      switch (this.tab) {
        case "1":
          this.getOrgList();
          break;
        case "2":
          this.getRoleByOrgID();
          this.getUserList();
          break;
        case "3":
          this.getUserInfoList();
          break;
        default:
          this.$message({
            message: "非法操作!",
            type: "error"
          });
          break;
      }
    },
    getOrgList() {
      this.orgListLoading = true;
      this.ajax(
        "组织列表",
        { organizationid: this.activeOrg.id },
        (ret, err) => {
          this.orgListLoading = false;
          if (ret === null) {
            this.$message({
              message: err.msg,
              type: "error"
            });
          } else {
            this.orgList = ret.data;
          }
        }
      );
    },
    searchUser(form) {
      this.$refs.userList.loadingBtnState.searchState = true;
      this.userForm = form;
      this.getUserList();
    },
    getUserList() {
      this.userListLoading = true;
      this.ajax(
        "组织用户列表",
        { orgid: this.activeOrg.id, ...this.userForm },
        (ret, err) => {
          this.$refs.userList.loadingBtnState.searchState = false;
          this.userListLoading = false;
          if (ret === null) {
            this.$message({
              message: err.msg,
              type: "error"
            });
          } else {
            this.userList = ret.data.result;
            this.userCount = ret.data.count;
          }
        }
      );
    },
    getRoleByOrgID() {
      this.ajax("默认角色", { id: this.activeOrg.id }, (ret, err) => {
        if (ret === null) {
          this.$message({
            message: err.msg,
            type: "error"
          });
        } else {
          if (!!ret.data[0]) {
            let arr = ret.data[0].RoleIDs.split(",");
            for (let i in arr) {
              arr[i] = parseInt(arr[i]);
            }
            this.defaultRole = arr;
          } else {
            this.defaultRole = [];
          }
        }
      });
    },
    removeActiveOrg() {
      for (let item of this.allOrgList) {
        if (this.activeOrg.pid === item.ID) {
          this.activeOrg.id = item.ID;
          this.activeOrg.name = item.Name;
          this.activeOrg.pid = item.ParentID;
          this.getOrgList();
          this.getOrgTree();
          break;
        }
      }
    },
    getUserInfoList(OrgID) {}
  }
};
</script>

<style lang="less" scoped>
.tree {
  float: left;
  width: 20%;
  transition: width 0.5s;
}
.table-list {
  float: right;
  width: 80%;
  transition: width 0.5s;
}
</style>