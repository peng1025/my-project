<template>
  <div id="app" class="fillcontain">
    <router-view/>
  </div>
</template>

<script>
export default {};
</script>

<style lang='less'>
.fillcontain {
  width: 100%;
  height: calc(100% - 10px);
  position: absolute;
  overflow: auto;
  top: 0;
  bottom: 0;
  left: 0;
  // padding-top: 10px;
  background-color: #fff;
  // background-image: url(/static/images/login-bg.jpg);
  background-repeat: no-repeat;
  background-size: cover;
}
</style>
