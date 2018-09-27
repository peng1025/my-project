<template>
  <el-row>
    <el-col>
      <div class="menu-warp" v-if="activeMode === 'vertical'">
        <div @mouseover="showNav('ishow')" @mouseout="hideNav('ishow')" class="menus-icon"><i class="el-icon-menu" style="font-weight: bold;"> 菜单</i></div>
        <el-menu @mouseover.native="showNav('mshow')" @mouseout.native="hideNav('mshow')" :default-active="activeIndex" ref="nav" class="el-menu-demo border" :unique-opened="true" :mode="activeMode" @select="handleSelect">
          <template v-for="menu in menus">
            <el-menu-item v-if="!menu.children" :key="menu.ID" :index="menu.Url || menu.ID" >{{ menu.Name }}</el-menu-item>
            <el-submenu v-else :index="menu.Url || menu.ID">
              <template slot="title">{{ menu.Name }}</template>
              <el-menu-item :index="child.Url" :key="child.ID" v-for="child in menu.children">{{ child.Name }}</el-menu-item>
            </el-submenu>
          </template>
        </el-menu>
      </div>
      <template v-else>
        <div v-if="!menus.length" style="height:10px;"></div>
        <el-menu :default-active="activeIndex" class="border" :unique-opened="true" :mode="activeMode" @select="handleSelect">
          <template v-for="menu in menus">
          <el-menu-item v-if="!menu.children" :key="menu.ID" :index="menu.Url || menu.ID" >{{ menu.Name }}</el-menu-item>
          <el-submenu v-else :index="menu.Url || menu.ID">
            <template slot="title">{{ menu.Name }}</template>
            <el-menu-item :index="child.Url" :key="child.ID" v-for="child in menu.children">{{ child.Name }}</el-menu-item>
          </el-submenu>
          </template>
        </el-menu>
      </template>
    </el-col>
  </el-row>
</template>
<script>
import router from "../router/index";
export default {
  props: ["activeMode", "menus"],
  data() {
    return { activeIndex: "/", ishow: false, mshow: false };
  },
  methods: {
    handleSelect(key) {
      this.activeIndex = key;
      this.$router.push(key);
    },
    showNav(target) {
      let nav = this.$refs["nav"];
      this[target] = true;
      nav.$el.className = "el-menu el-menu-demo border el-menu-show";
    },
    hideNav(target) {
      let nav = this.$refs["nav"];
      this[target] = false;
      setTimeout(() => {
        if (!this.ishow && !this.mshow) {
          nav.$el.className = "el-menu el-menu-demo border";
        }
      }, 1000);
    }
  }
};
</script>
<style lang="less" scoped>
.menu-warp .el-menu-demo {
  width: 100%;
  padding-top: 20px;
  transform: translateX(0);
  opacity: 0;
  z-index: 10;
  transition: all 0.5s ease;
}
.menu-warp .el-menu-show {
  transform: translateX(300px);
  opacity: 1;
}
.menus-icon {
  position: absolute;
  top: -60px;
  transform: translateX(300px);
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  z-index: 10;
  color: #66b1ff;
  &:hover {
    background: #66b1ff;
    color: aliceblue;
  }
}
</style>
