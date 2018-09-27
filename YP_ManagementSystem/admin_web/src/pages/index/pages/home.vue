<template>
  <div>
    <el-header class="header">
      <page-header></page-header>
    </el-header>
    <div :class="activeMode.class">
      <page-nav :activeMode="activeMode.mode" :menus="menus"></page-nav>
    </div>
    <el-main class="main bb">
      <router-view></router-view>
    </el-main>
  </div>
</template>

<script>
import pageHeader from "../../../components/header";
import pageNav from "../../../components/nav";
let typeN = "h"; //控制导航条水平或垂直,垂直时="v",水平时="h";
export default {
  components: {
    pageHeader,
    pageNav
  },
  data() {
    return {
      menus: [],
      activeMode: (function(type) {
        switch (type) {
          case "h":
            return {
              class: "horizontalNav",
              mode: "horizontal"
            };
          case "v":
            return {
              class: "verticalNav",
              mode: "vertical"
            };
          default:
            return {
              class: "verticalNav",
              mode: "vertical"
            };
        }
      })(typeN)
    };
  },
  created() {
    this.getMenu();
  },
  methods: {
    getMenu() {
      this.storage.get("userPermission", obj => {
        this.menus = this.formatMenus([
          {
            ID: 999,
            Url: "/home",
            ParentID: 1,
            Type: 0,
            Name: "首页",
            hasRight: true
          },
          ...obj
        ]);
      });
    },
    formatMenus(data) {
      let arr = [];
      for (let item of data) {
        if (item.hasRight && (item.Type === 0 || item.Type === 1)) {
          item.ID = item.ID.toString();
          if (item.ParentID === 1) {
            item.children = [];
            for (let children of data) {
              if (
                children.hasRight &&
                children.ParentID === parseInt(item.ID)
              ) {
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
    }
  }
};
</script>

<style lang="less">
body {
  margin: 0;
  padding: 0;
}
.border {
  background: #fff;
  overflow: hidden;
}
.clearfix {
  overflow: auto;
  zoom: 1;
}
.fl {
  float: left;
}
.fr {
  float: right;
}
.pd10 {
  padding: 10px;
}
.pd20 {
  padding: 20px;
}
.header {
  background: linear-gradient(to right, #0099ff, #ddffff);
}
.main {
  padding: 0 20px;
}
.el-table {
  border-radius: 10px;
}
.el-table th {
  background-color: #ffc33d;
  color: #fff;
}
.bb {
  box-sizing: border-box;
}
.verticalNav {
  transform: translateX(-300px);
  width: 300px;
  padding: 20px;
  box-sizing: border-box;
  position: absolute;
  margin-top: -20px;
  position: absolute;
  z-index: 10;
}
.text-over {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.horizontalNav {
  width: 100%;
  min-height: 60px;
  padding: 0 20px;
  box-sizing: border-box;
  position: relative;
}
</style>