<template>
  <div>
    <div class="hello">
      <h1>{{ msg }}</h1>
      <rich-text-editor :text="content" @editorChange="editorChange">
      </rich-text-editor>
      <p>
        <el-button type="primary" @click="submit">提交</el-button>
      </p>

    </div>
    <div class="detailShow ql-editor">
      <h1>展示内容</h1>
      <div id="detailShow" class="detailInfo"></div>
    </div>
  </div>
</template>

<script>
import richTextEditor from "./richTextEditor.vue";
export default {
  name: "Hello",
  components: { richTextEditor },
  data() {
    return {
      msg: "编辑内容",
      content: ""
    };
  },
  methods: {
    editorChange: function(html) {
      this.content = html;
      console.log(this.content);
    },
    submit() {
      localStorage.setItem("editorInfo", this.content);
      this.$message({
        type: "success",
        message: "保存成功"
      });
      this.init();
    },
    init() {
      let detailShow = document.getElementById("detailShow");
      let data = localStorage.getItem("editorInfo");
      detailShow.innerHTML = data;
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.hello {
  width: 48%;
  float: left;
}
.detailShow {
  width: 48%;
  float: right;
}
.detailInfo {
  border: solid 1px black;
  widows: 100%;
  height: 600px;
}
</style>