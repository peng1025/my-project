<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
        <rich-text-editor :text="content" @editorChange="editorChange">
    </rich-text-editor>
  </div>
</template>

<script>
  import richTextEditor from './richTextEditor.vue'
export default {
  name: '订单详情',
  components: {richTextEditor},
  data () {
    return {
      msg: '订单详情',
      content: ''
    }
  },
  methods: {
    editorChange: function(html) {
      this.content = html
    }
  },
  mounted(){
    this.content=`<span style="color:red">你是谁</span>`
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
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
</style>