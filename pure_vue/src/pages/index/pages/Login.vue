<template>
  <div class="login_page">
    <transition name="form-fade" mode="in-out">
      <section class="form_contianer" v-show="showLogin">
        <div class="manage_tip">
          <p>{{sysName}}</p>
        </div>
        <el-form :model="loginForm" status-icon :rules="rules" ref="loginForm" v-loading="loading">
          <el-form-item prop="name">
            <el-input v-model="loginForm.name" placeholder="请输入账号"></el-input>
          </el-form-item>
          <el-form-item prop="pwd">
            <el-input type="password" @keyup.enter.native="submitForm('loginForm')" v-model="loginForm.pwd" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item prop="checkcode" v-if="checkCodeObject.ifShow">
            <el-col :span="14">
              <el-input @keyup.enter.native="submitForm('loginForm')" v-model="loginForm.checkcode" placeholder="请输入验证码"></el-input>
            </el-col>
            <el-col :span="10">
              <img class="captcha" @click="getCheckCode" :src="checkCodeObject.captcha" alt="点击获取">
            </el-col>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('loginForm')">登录</el-button>
          </el-form-item>
        </el-form>
      </section>
    </transition>
    <div id="loginThree"></div>
  </div>
</template>
<script>
import THREE from "../style/three";
export default {
  data() {
    return {
      sysName: "JDSPB后台管理系统",
      showLogin: false,
      loading: false,
      loginForm: {
        name: "",
        pwd: "",
        checkcode: ""
      },
      checkCodeObject: {
        //svg图片
        captcha: "",
        ifShow: false
      },
      rules: {
        name: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
          // { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
          {
            pattern: /^[a-z0-9]{3,20}$/i,
            message: "格式错误,请输入3到20个字母或数字",
            trigger: "blur"
          }
        ],
        pwd: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          {
            pattern: /^[a-z0-9]{3,20}$/i,
            message: "格式错误,请输入3到20个字母或数字",
            trigger: "blur"
          }
        ],
        checkcode: [
          { required: true, message: "验证码不能为空", trigger: "blur" }
        ]
      }
    };
  },
  mounted() {
    //3D动画方法调用
    this.init3D();
    this.checkCodeIfShow();
    //登录框显示
    this.showLogin = true;
  },
  methods: {
    getCheckCode() {
      this.checkCodeObject.captcha = "/pub/getCheckCode?id=" + +new Date();
    },
    //提交form表单
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.login();
        } else {
          return false;
        }
      });
    },
    checkCodeIfShow(type) {
      let loginStorage = JSON.parse(localStorage.getItem("loginStorage"));
      if (!loginStorage) {
        this.checkCodeObject.ifShow = false;
        localStorage.setItem(
          "loginStorage",
          JSON.stringify({
            loginCount: 1,
            time: new Date(new Date().getTime() + 1000 * 60 * 60)
          })
        );
      } else {
        if (loginStorage.loginCount >= 3) {
          this.checkCodeObject.ifShow = true;
          this.getCheckCode();
        }
        if (new Date(loginStorage.time) <= new Date()) {
          loginStorage.time = new Date(new Date().getTime() + 1000 * 60 * 60);
          loginStorage.loginCount = 1;
          this.checkCodeObject.ifShow = false;
        } else if (type == "Login") {
          loginStorage.loginCount += 1;
        }
        localStorage.setItem("loginStorage", JSON.stringify(loginStorage));
      }
    },
    loginCallBack(ret, err) {
      this.loading = false;
      if (ret === null) {
        if (err.code === 406) {
          this.checkCodeObject.ifShow = true;
          this.getCheckCode();
        }
        this.loginForm.checkcode = "";
        this.$message({
          message: err.msg,
          type: "error"
        });
        this.checkCodeIfShow("Login");
      } else {
        localStorage.removeItem("loginStorage");
        this.storage.set("userPermission", ret.data.permission);
        let obj = {};
        if (!!ret.data.permission.length) {
          for (let p of ret.data.permission) {
            if (p.Type === 2) {
              obj[p.Url] = p;
            }
          }
        }
        //登录根据权限动态添加路由
        this.dynamicRouter();
        this.$router.addRoutes(this.$router.options.routes);
        this.storage.set("showPermission", obj);
        this.storage.set("userOrg", {
          id: ret.data.OrgID,
          name: ret.data.OrgName,
          pid: ret.data.OrgParentID
        });
        this.storage.set(
          "userInfo",
          {
            id: ret.data.ID,
            name: ret.data.Name
          },
          () => {
            this.$router.replace(this.$route.query.url || "/");
          }
        );
      }
    },
    //登录异步请求方法
    login() {
      this.loading = true;
      this.ajax(
        "登录",
        {
          userName: this.loginForm.name,
          password: this.loginForm.pwd,
          checkcode: this.loginForm.checkcode
        },
        this.loginCallBack
      );
    },
    //3D动画初始化方法
    init3D() {
      // 初始化3D动画
      var SCREEN_WIDTH = window.innerWidth;
      var SCREEN_HEIGHT = window.innerHeight;
      var SEPARATION = 90;
      var AMOUNTX = 50;
      var AMOUNTY = 50;
      var container;
      var particles, particle;
      var count;
      var camera;
      var scene;
      var renderer;
      var mouseX = 0;
      var mouseY = 0;
      var windowHalfX = window.innerWidth / 2;
      var windowHalfY = window.innerHeight / 2;
      init();
      this.interval = setInterval(loop, 1000 / 60);
      function init() {
        container = document.createElement("div");
        container.style.position = "relative";
        container.style.top = "200px";
        document.getElementById("loginThree").appendChild(container);
        camera = new THREE.Camera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
        camera.position.z = 1000;
        scene = new THREE.Scene();
        renderer = new THREE.CanvasRenderer();
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        particles = new Array();
        var i = 0;
        var material = new THREE.ParticleCircleMaterial(0x097bdb, 1);
        for (var ix = 0; ix < AMOUNTX; ix++) {
          for (var iy = 0; iy < AMOUNTY; iy++) {
            particle = particles[i++] = new THREE.Particle(material);
            particle.position.x = ix * SEPARATION - AMOUNTX * SEPARATION / 2;
            particle.position.z = iy * SEPARATION - AMOUNTY * SEPARATION / 2;
            scene.add(particle);
          }
        }
        count = 0;
        container.appendChild(renderer.domElement);
        document.addEventListener("mousemove", onDocumentMouseMove, false);
        document.addEventListener("touchmove", onDocumentTouchMove, false);
      }
      function onDocumentMouseMove(event) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
      }
      function onDocumentTouchMove(event) {
        if (event.touches.length == 1) {
          event.preventDefault();
          mouseX = event.touches[0].pageX - windowHalfX;
          mouseY = event.touches[0].pageY - windowHalfY;
        }
      }
      function loop() {
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y = 364;
        var i = 0;
        for (var ix = 0; ix < AMOUNTX; ix++) {
          for (var iy = 0; iy < AMOUNTY; iy++) {
            particle = particles[i++];
            particle.position.y =
              Math.sin((ix + count) * 0.3) * 50 +
              Math.sin((iy + count) * 0.5) * 50;
            particle.scale.x = particle.scale.y =
              (Math.sin((ix + count) * 0.3) + 1) * 2 +
              (Math.sin((iy + count) * 0.5) + 1) * 2;
          }
        }
        renderer.render(scene, camera);
        count += 0.1;
      }
    }
  }
};
</script>

<style scoped lang="less">
@import "../style/mixin";
.login_page {
  .wh(100%, 100%);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  text-align: center;
  background-color: #141a48;
  background-image: url(/static/images/login-bg.jpg);
  background-repeat: no-repeat;
  background-size: cover;
  overflow: hidden;
}
#loginThree {
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
  overflow: hidden;
}
.manage_tip {
  position: absolute;
  width: 100%;
  top: -100px;
  left: 0;
  p {
    font-size: 34px;
    color: #fff;
  }
}
.captcha {
  vertical-align: top;
}
.form_contianer {
  .wh(320px, auto);
  .ctp(320px, 150px);
  padding: 25px;
  border-radius: 5px;
  z-index: 10;
  text-align: center;
  background-color: #fff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  .submit_btn {
    width: 100%;
    font-size: 16px;
  }
}
.form-fade-enter-active,
.form-fade-leave-active {
  transition: all 1s;
}
.form-fade-enter,
.form-fade-leave-active {
  transform: translate3d(0, -50px, 0);
  opacity: 0;
}
.captcha {
  width: 120px;
  height: 39px;
  border: 1px solid #dcdfe6;
  background-image: none;
  border-radius: 4px;
}
</style>
