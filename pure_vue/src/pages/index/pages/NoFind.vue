<template>
    <div @click="back" title="点击返回首页">
      <h1 class="msg">您要访问的页面不存在!请点击返回首页!</h1>
    </div>
</template>

<script>
export default {
  methods:{
    back(){
      this.$router.push('/');
    }
  }
};
</script>

<style lang="less" scoped>
div {
  font-size: 20px;
  line-height: 50px;
  color: #555;
  max-width: 900px;
  margin: auto;
  height: 100%;
  min-height: 550px;
  background: url("../assets/404.jpg") no-repeat center;
}
.msg{
  text-align: center;
  text-shadow: 2px 2px 2px #ccc;
}
</style>
