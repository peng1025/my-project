<template>
  <div class="border pd10 test">
    <p class="text text_one" style="">欢迎您访问角色权限管理系统</p>
    <p class="text">愿您高效完成工作,记得给自己一个微笑哦🙂</p>
    <div>
      <span class="spanDes">系统维护人员联系方式</span>
      <div style="width:300px;min-height:260px;">
        <my-table :tableFormat="tableFormat" :data="data" :options="options"></my-table>
      </div>
    </div>
  </div>

</template>
<script>
export default {
  data() {
    return {
      tableFormat: [
        { prop: "name", label: "姓名", width: "100" },
        { prop: "phone", label: "联系方式" }
      ],
      options: {},
      data: [
       
      ]
    };
  }
};
</script>
<style scoped>
.test {
  min-height: 440px;
  background-image: url(/static/images/105459445.jpg);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
.text {
  -webkit-margin-before: 0.2rem;
  -webkit-margin-after: 0.2rem;
  text-align: center;
  font-size: 2rem;
}
.text_one {
  padding-top: 10%;
}
.spanDes {
  padding-bottom: 20px;
  display: block;
  padding-left: 50px;
}
</style>
