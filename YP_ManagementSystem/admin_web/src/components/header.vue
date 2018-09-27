<template>
  <el-row class="">
    <el-col :span="4" class="clearfix">
      <div class="fl logo"></div>
    </el-col>
    <el-col :span="20" class="users">
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
export default {
  data() {
    return {
      name: "",
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
    this.name = this.storage.get("userInfo").name;
  },
  methods: {
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
    clearQuit() {
      this.storage.clear();
      this.$router.push("/pagelogin");
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
.logo {
  margin-left: 60px;
}
</style>