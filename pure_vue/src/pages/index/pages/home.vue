<template>
  <el-container>
    <el-header>
      <page-header></page-header>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
    <el-footer>
      
    </el-footer>
  </el-container>
</template>

<script>
import pageHeader from "../components/header";
export default {
  components: {
    pageHeader
  },
};
</script>

<style lang="less">
.border {
  background: #fff;
  overflow: hidden;
  border: solid 1px #e6e6e6;
  border-radius: 10px;
  box-shadow: 2px 2px 2px #606266;
}
.el-main{
  padding: 20px;
}
.pd10 {
  padding: 10px;
}
.pd20 {
  padding: 20px;
}
.el-table th {
  background-color: #808080;
  color: aliceblue;
}
</style>