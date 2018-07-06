<template>
  <div>
    <div class="mainDiv animated">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="登录" name="sign in"></el-tab-pane>
        <el-tab-pane label="注册" name="sign up"></el-tab-pane>
      </el-tabs>
      <!-- 登录Form -->
      <el-form ref="form" class="form" v-if="activeName==='sign in'" :model="loginForm" label-width="80px">
        <el-form-item>
          <el-input placeholder="请输入用户名" v-model="loginForm.loginName">
            <template slot="prepend">用户名</template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input placeholder="请输入密码" type="password" v-model="loginForm.password">
            <template slot="prepend">密码</template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
      <!-- 注册Form -->
      <el-form ref="form" class="form" v-if="activeName==='sign up'" :model="registerForm" label-width="80px">
        <el-form-item>
          <el-input placeholder="请输入用户名" v-model="registerForm.loginName">
            <template slot="prepend">用户名</template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input placeholder="请输入密码" type="password" v-model="registerForm.password">
            <template slot="prepend">密码</template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input placeholder="请输入密码" type="password" v-model="registerForm.secondPassword">
            <template slot="prepend">确认密码</template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      activeName: "sign in",
      loginForm: {
        loginName: "",
        password: ""
      },
      registerForm: {
        loginName: "",
        password: "",
        secondPassword: ""
      }
    };
  },
  mounted() {},
  methods: {
    handleClick() {},
    onSubmit() {}
  }
};
</script>

<style>
.mainDiv {
  position: fixed;
  width: 400px;
  height: 300px;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  margin: auto;
  background-color: rgba(0, 0, 0, 0.2);
  text-align: center;
  box-shadow: 10px 10px 10px #909399;
}
html {
  background-image: url(/static/images/500081683.jpg);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  height: 100%;
}
.el-input-group__prepend {
  width: 55px;
}
.el-tabs__nav-wrap {
  margin: 0px 80px;
}
.el-form-item__content {
  text-align: center;
}
.form {
  margin-right: 78px;
}

.animated {
  animation-duration: 1s; /*动画时间*/
  animation-fill-mode: both; /*播放后的状态*/
}

.animated {
  animation-iteration-count: 1; /*动作循环的次数：infinite 无限循环*/
}

.animated {
  animation-duration: 2s; /*动画时间*/
}
.mainDiv {
  animation-name: container; /*动画的名称*/
  transform-origin: center bottom; /*设置动画旋转元素的基点为：居中靠下*/
  cursor: pointer;
}

@keyframes container {
  0%,
  100%,
  20%,
  50%,
  80% {
    transition-timing-function: cubic-bezier(
      0.215,
      0.61,
      0.355,
      1
    ); /*贝塞尔曲线 ： X1 Y1 X2 Y2*/
    transform: translate3d(0, 0, 0); /*设置只在Z轴上移动*/
  }
  40%,
  43% {
    transition-timing-function: cubic-bezier(0.755, 0.5, 0.855, 0.06);
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transition-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}
</style>

