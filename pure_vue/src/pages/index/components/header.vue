<template>
  <el-row class="border">
    <el-col class="menus">
      <div v-if="!menus.length" style="height:10px;"></div>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
        <template v-for="menu in menus">
        <el-menu-item v-if="!menu.children" :key="menu.ID" :index="menu.Url || menu.ID" >{{ menu.Name }}</el-menu-item>
        <el-submenu v-else :index="menu.Url || menu.ID">
          <template slot="title">{{ menu.Name }}</template>
          <el-menu-item :index="child.Url" :key="child.ID" v-for="child in menu.children">{{ child.Name }}</el-menu-item>
        </el-submenu>
        </template>
      </el-menu>
    </el-col>
    <el-col class="users">
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          {{name}}<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-col>
    <el-dialog
      title="修改密码"
      :visible.sync="dialogVisible"
      width="40%"
      @close="closePassForm">
    <el-form :model="passwordForm" status-icon :rules="rules" ref="passwordForm" label-width="20%" class="demo-ruleForm">
      <el-form-item label="原密码" prop="oldpassword">
        <el-input type="password" v-model="passwordForm.oldpassword"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="password">
        <el-input type="password" v-model="passwordForm.password" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input type="password" v-model="passwordForm.checkPass" auto-complete="off"></el-input>
      </el-form-item>
      <div>
        <div class="center">
          <el-button type="primary" @click="submitForm('passwordForm')">保存</el-button>
          <el-button @click="closePassForm">取消</el-button>
        </div>
      </div>
    </el-form>
    </el-dialog>
  </el-row>
</template>

<script>
import router from "../router/index";
export default {
  data() {
    return {
      activeIndex: "/",
      name: "",
      menus: [],
      dialogVisible: false,
      passwordForm: {
        id: "",
        oldpassword: "",
        password: "",
        checkPass: ""
      },
      rules: {
        oldpassword: [
          { required: true, message: "请输入原密码", trigger: "blur" },
          {
            pattern: /^[a-z0-9]{3,20}$/i,
            message: "格式错误,请输入3到20个字母或数字",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          {
            pattern: /^[a-z0-9]{3,20}$/i,
            message: "格式错误,请输入3到20个字母或数字",
            trigger: "blur"
          },
          {
            validator: (rule, value, callback) => {
              if (value === this.passwordForm.oldpassword) {
                callback(new Error("不能与原密码一致!"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        checkPass: [
          { required: true, message: "请确认密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.passwordForm.password) {
                callback(new Error("两次输入密码不一致!"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.getMenu();
      this.name = this.storage.get("userInfo").name;
    },
    getMenu() {
      this.storage.get("userPermission", obj => {
        this.menus = this.formatMenus([
          { ID: 999, Url: "/", ParentID: 1, Type: 0, Name: "首页" },
          ...obj
        ]);
      });
    },
    formatMenus(data) {
      let arr = [];
      for (let item of data) {
        if (item.Type === 0 || item.Type === 1) {
          item.ID = item.ID.toString();
          if (item.ParentID === 1) {
            item.children = [];
            for (let children of data) {
              if (children.ParentID === parseInt(item.ID)) {
                item.children.push(children);
              }
            }
            if (item.children.length === 0) {
              item.children = false;
            }
            arr.push(item);
          }
        }
      }
      return arr;
    },
    closePassForm() {
      this.dialogVisible = false;
      this.$refs["passwordForm"].resetFields();
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.ajax("修改密码", this.passwordForm, (ret, err) => {
            this.loading = false;
            if (ret === null) {
              this.$message({
                message: err.msg,
                type: "error"
              });
            } else {
              this.$message({
                message: "修改成功,请重新登录!",
                type: "success"
              });
              this.clearQuit();
            }
          });
        } else {
          return false;
        }
      });
    },
    handleSelect(key) {
      this.$router.push(key);
    },
    clearQuit() {
      this.storage.clear();
      this.$router.push("/login");
    },
    logout(ret, err) {
      if (ret === null) {
        this.$message({
          message: err.msg,
          type: "error"
        });
      } else {
        this.clearQuit();
      }
    },
    handleCommand(command) {
      switch (command) {
        case "logout":
          this.ajax(
            "登出",
            { userName: this.storage.get("userInfo").name },
            this.logout
          );
          break;
        case "changePassword":
          this.passwordForm.id = this.storage.get("userInfo").id;
          this.dialogVisible = true;
          break;
        default:
          this.$message({
            message: "非法操作!",
            type: "error"
          });
          break;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.el-menu {
  border: none;
}
.el-dropdown {
  line-height: 60px;
  padding: 0 20px;
  float: right;
}
.menus {
  float: left;
  width: 80%;
}
.users {
  float: right;
  width: 20%;
}
.center {
  display: inline-block;
  margin-left: 50%;
  transform: translateX(-50%);
}
</style>