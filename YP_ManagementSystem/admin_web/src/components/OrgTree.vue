<template>
<el-row>
  <el-col :span="24" class="pd10">
    <el-tree :data="orgTree" node-key="id" :expand-on-click-node="false" :highlight-current="true" default-expand-all :props="defaultProps" @node-click="handleOrgClick"></el-tree>
  </el-col>
</el-row>
</template>

<script>
export default {
  props: ["orgTree", "defaultProps"],
  methods: {
    handleOrgClick(org) {
      this.$emit("getList", { id: org.ID, name: org.Name, pid: org.ParentID });
    }
  }
};
</script>

<style lang="less" scoped>
</style>