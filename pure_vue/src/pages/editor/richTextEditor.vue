<template>
  <div style="height:600px">
    <quill-editor ref="newEditor" :options="newOption" style="height: 90%; margin-bottom: 54px" v-model="editorContent" @change="editorChange">
    </quill-editor>
    <form action="" method="post" enctype="multipart/form-data" id="uploadFormMulti">
      <input style="display: none" :id="uniqueId" type="file" name="avator" multiple accept="image/jpg,image/jpeg,image/png,image/gif" @change="uploadImg('uploadFormMulti')">
      <!--style="display: none"-->
    </form>
  </div>
</template>
<script>
import { quillEditor } from "vue-quill-editor";
import Quill from "quill";
import { ImageImport } from "./modules/ImageImport.js";
import { ImageResize } from "./modules/ImageResize.js";
Quill.register("modules/imageImport", ImageImport);
Quill.register("modules/imageResize", ImageResize);
export default {
  props: ["text", "editorId"],
  components: { quillEditor },
  data() {
    return {
      editorContent: "",
      uniqueId: "",
      imgPercent: 0,
      imageLoading: false,
      newOption: {
        placeholder: "请填写内容",
        history: {
          delay: 100,
          maxStack: 100,
          userOnly: false
        },
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ["clean"],
            ["link", "image", "video"]
          ],
          imageImport: true,
          imageResize: {
            displaySize: true
          }
        },
        strict: false //should be false for ignore unexpected update
      },
      addImgRange: "" //全局参数，每次添加图片时记录当前索引和长度
    };
  },
  computed: {},
  methods: {
    editorChange({ editor, html, text }) {
      var vm = this;
      vm.$emit("editorChange", html);
    },
    uploadImg: async function(id) {
      var vm = this;
      vm.imageLoading = true;
      var formData = new FormData(document.getElementById(id)[0]);
      console.log("uploadImg");
      try {
        const url = await vm.uploadImgReq(formData);
        console.log(url);
        if (url != null && url.length > 0) {
          var value = url;
          value = value.indexOf("http") != -1 ? value : "http:" + value; //返回图片网址中如果没有http自动拼接
          let index = vm.addImgRange != null ? vm.addImgRange.index : 0; // 获取插入时的位置索引，如果获取失败，则插入到最前面
          vm.$refs.newEditor.quill.insertEmbed(
            index,
            "image",
            value,
            Quill.sources.USER
          );
          vm.$refs.newEditor.quill.setSelection(index + 1); //调整光标到插入图片的后面
          var img = new Image();
          img.src = value;
          vm.$refs.newEditor.quill.formatText(
            index,
            index + 1,
            "width",
            400 + "px"
          );
        } else {
        }
        document.getElementById(vm.uniqueId).value = "";
      } catch ({ message: msg }) {
        document.getElementById(vm.uniqueId).value = "";
      }
      vm.imageLoading = false;
    },
    uploadImgReq(formData) {
      // 实现图片上传
      return new Promise((resolve, reject) => {
        if (true) {
          resolve(
            "http://img.zcool.cn/community/0117e2571b8b246ac72538120dd8a4.jpg@1280w_1l_2o_100sh.jpg"
          );
        } else {
          reject({ message: "图片上传失败" });
        }
      });
    }
  },
  created: function() {
    var vm = this;
    vm.imgPercent = 0;
    vm.editorContent = vm.text;
    vm.uniqueId = vm.editorId ? vm.editorId : "inputImg";
  },
  watch: {
    text: function() {
      var vm = this;
      vm.editorContent = vm.text;
    }
  },
  mounted() {
    var vm = this;
    // you can use current editor object to do something(quill methods)
    var imgHandler = async function(image) {
      vm.addImgRange = vm.$refs.newEditor.quill.getSelection();
      if (image) {
        var fileInput = document.getElementById(vm.uniqueId); //隐藏的file文本ID
        fileInput.click(); //加一个触发事件
      }
    };
    vm.$refs.newEditor.quill
      .getModule("toolbar")
      .addHandler("image", imgHandler);
  }
};
</script>
<style scoped>

</style>