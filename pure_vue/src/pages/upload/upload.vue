<template>
  <div>
    <div class="photo-page">
      <section id="firstSection">
        <div id="firstPictureBg" class="photo-bg">
          <div class="img-panel first-picture">
            <!--:style="'backgroundImage:url('+Imgs.firstPicture+')'" -->
            <img class="img" id="firstPictureImg" :src="Imgs.firstPicture">
          </div>
          <div class=" camera-bg"></div>
          <input type="file" id="firstPicture" name="firstPicture" capture="camera" accept="image/*" @change="upload">
        </div>
      </section>
      <div class="description">拍摄IMEI号码</div>
      <section id="secondSection">
        <div id="secondPictureBg" class="photo-bg">
          <div class="img-panel second-picture">
            <!--:style="'backgroundImage:url('+Imgs.secondPicture+')'"-->
            <img class="img" id="secondPictureImg" :src="Imgs.secondPicture">
          </div>
          <div class="camera-bg"></div>
          <input type="file" id="secondPicture" name="secondPicture" capture="camera" accept="image/*" @change="upload">
        </div>
      </section>
      <div class="description">拍摄正面三色照片</div>
      <div id="uploadButton" class="upload-button" @click="handleSubmit" v-if="showState">上传</div>
    </div>
    <div style="padding:20px;">
      <div class="show">
        <div class="picture" :style="'backgroundImage:url('+Imgs.firstPicture+')'"></div>
      </div>
      <div class="show">
        <div class="picture" :style="'backgroundImage:url('+Imgs.secondPicture+')'"></div>
      </div>
      <div style="margin-top:20px;">
        <input type="file" id="upload" accept="image/*" capture="camera" @change="upload">
        <label for="upload"></label>
      </div>
    </div>
    <alert-tip v-if="showAlert" :showHide="showAlert" @closeTip="closeTip" :alertText="alertText"></alert-tip>
  </div>
</template> 
<script>
import Exif from "exif-js";
import { MessageBox } from "mint-ui";
import alertTip from "../../components/common/alertTip";
export default {
  data() {
    return {
      alertText: null, //提示的内容
      showAlert: false, //显示提示组件
      Imgs: {
        firstPicture: "",
        secondPicture: ""
      },
      reImgData: {
        firstPictureURL: "",
        secondPictureURL: ""
      },
      firstImage: "",
      secondImage: "",
      codeID: "",
      showState: true
    };
  },
  components: {
    alertTip
  },
  mounted() {
    //设置要设置初始化事件的element的id前缀
    let initArr = ["first", "second"];
    //循环设置dom事件
    for (let on of initArr) {
      //handlePicture(on);//先给element加处理事件
      this.clickSection(on); //再加点击事件
    }
    document.documentElement.style.fontSize =
      document.documentElement.clientWidth / 6.4 + "px";
    const str = window.location.search.substr(1).toString();
    this.codeID = str.split("=")[1];
    //handleSubmit(); //最后加上传按钮点击事件
  },
  methods: {
    //点击图片区域拍照方法
    clickSection(on) {
      let Section = eval(on + "Section");
      let Picture = eval(on + "Picture");
      Section.addEventListener(
        "click",
        function() {
          Picture.click();
          event.stopPropagation();
        },
        false
      );
    },
    upload(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      let picValue = files[0];
      this.imgPreview(picValue, e.target.id);
    },
    handleSubmit() {
      this.showState = false;
      if (
        !this.reImgData.firstPictureURL ||
        !this.reImgData.firstPictureURL.length > 0
      ) {
        this.$message({
          message: "第一张图片未保存成功,请再试一下!",
          type: "warning",
          duration: 0
        });
        // this.showAlert = true;
        // this.alertText = "手机号码不正确";
        // MessageBox.alert("第一张图片未保存成功,请再试一下!", "提示");
        this.showState = true;
        return;
      }
      if (
        !this.reImgData.secondPictureURL ||
        !this.reImgData.secondPictureURL.length > 0
      ) {
        // this.$message({
        //   message: "第二张图片未保存成功,请再试一下!",
        //   type: "warning"
        // });
        MessageBox.alert("第二张图片未保存成功,请再试一下!", "提示");
        this.showState = true;
        return;
      }
      this.ajax(
        "图片提交",
        {
          codeID: this.codeID,
          pic1Url: this.reImgData.firstPictureURL,
          pic2Url: this.reImgData.secondPictureURL
        },
        (res, err) => {
          if (res === null) {
            // this.$message({
            //   message: "提交错误，请重试。错误信息：" + err.msg,
            //   type: "error"
            // });
            MessageBox.alert("提交错误，请重试。错误信息：" + err.msg, "提示");
            this.showState = true;
          } else {
            // this.$message({
            //   message: "上传成功",
            //   type: "success"
            // });
            MessageBox.alert("上传成功", "提示");
          }
        }
      );
    },
    imgPreview(file, obj) {
      let self = this;
      let Orientation;
      let Img = eval(obj + "Img"); //展示图片dom
      let bg = eval(obj + "Bg");
      //去获取拍照时的信息，解决拍出来的照片旋转问题
      Exif.getData(file, function() {
        Orientation = Exif.getTag(this, "Orientation");
      });
      // 看支持不支持FileReader
      if (!file || !window.FileReader) return;
      if (/^image/.test(file.type)) {
        // 创建一个reader
        let reader = new FileReader();
        // 将图片2将转成 base64 格式
        reader.readAsDataURL(file);
        // 读取成功后的回调
        reader.onloadend = async function() {
          let result = this.result;
          let img = new Image();
          img.src = result;
          //判断图片是否大于100K,是就直接上传，反之压缩图片
          if (this.result.length <= 100 * 1024) {
            self.Imgs[obj] = this.result;
            self.postImg(file, obj);
          } else {
            img.onload = function() {
              let data = self.compress(img, Orientation);
              self.Imgs[obj] = data.ndata;
              self.postImg(data.blob, obj);
            };
            Img.onload = function() {
              bg.style.height = Img.clientHeight + "px";
            };
          }
        };
      }
    },
    postImg(file, obj) {
      //这里写接口
      //图片上传方法
      let formDate = new FormData();
      formDate.append("file", file);
      formDate.append(
        "codeID",
        this.codeID ||
          "cd85558b9e374c4492e1d28622a3d241fb95d7bd27d422360ead016a355999a8d327688423a26f512085e86819b6f004"
      );
      this.ajax("图片上传", formDate, (res, err) => {
        if (res === null) {
          this.$message({
            message: "上传失败，请重试。错误信息：" + err.msg,
            type: "error"
          });
        } else {
          this.reImgData[obj + "URL"] = res.data;
        }
      });
      // function uploadPicture(formDate, on) {
      //   $.ajax({
      //     url: "/api/uploadImage",
      //     type: "POST",
      //     cache: false,
      //     data: formDate,
      //     processData: false,
      //     contentType: false,
      //     success: function(data) {
      //       layer.closeAll();
      //       if (data.code === 200) {
      //         if (on === "first") {
      //           firstURL = data.data;
      //         } else {
      //           secondURL = data.data;
      //         }
      //       } else if (data.code === 400) {
      //         layer.open({
      //           content: data.msg,
      //           btn: "我知道了"
      //         });
      //       } else {
      //         layer.open({
      //           content: "上传失败,请再试一下!" + data.code,
      //           btn: "我知道了"
      //         });
      //       }
      //     },
      //     error: function(err) {
      //       layer.closeAll();
      //       layer.open({
      //         content: "上传失败,请再试一下!" + err.status,
      //         btn: "我知道了"
      //       });
      //     }
      //   });
      // }
    },
    rotateImg(img, direction, canvas) {
      //最小与最大旋转方向，图片旋转4次后回到原方向
      const min_step = 0;
      const max_step = 3;
      if (img == null) return;
      //img的高度和宽度不能在img元素隐藏后获取，否则会出错
      let height = img.height;
      let width = img.width;
      let step = 2;
      if (step == null) {
        step = min_step;
      }
      if (direction == "right") {
        step++;
        //旋转到原位置，即超过最大值
        step > max_step && (step = min_step);
      } else {
        step--;
        step < min_step && (step = max_step);
      }
      //旋转角度以弧度值为参数
      let degree = step * 90 * Math.PI / 180;
      let ctx = canvas.getContext("2d");
      switch (step) {
        case 0:
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          break;
        case 1:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(degree);
          ctx.drawImage(img, 0, -height);
          break;
        case 2:
          canvas.width = width;
          canvas.height = height;
          ctx.rotate(degree);
          ctx.drawImage(img, -width, -height);
          break;
        case 3:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(degree);
          ctx.drawImage(img, -width, 0);
          break;
      }
    },
    compress(img, Orientation) {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      //瓦片canvas
      let tCanvas = document.createElement("canvas");
      let tctx = tCanvas.getContext("2d");
      let initSize = img.src.length;
      let width = img.width;
      let height = img.height;
      //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
      let ratio;
      if ((ratio = width * height / 4000000) > 1) {
        console.log("大于400万像素");
        ratio = Math.sqrt(ratio);
        width /= ratio;
        height /= ratio;
      } else {
        ratio = 1;
      }
      canvas.width = width;
      canvas.height = height;
      // 铺底色
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      //如果图片像素大于100万则使用瓦片绘制
      let count;
      if ((count = width * height / 1000000) > 1) {
        console.log("超过100W像素");
        count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
        //  计算每块瓦片的宽和高
        let nw = ~~(width / count);
        let nh = ~~(height / count);
        tCanvas.width = nw;
        tCanvas.height = nh;
        for (let i = 0; i < count; i++) {
          for (let j = 0; j < count; j++) {
            tctx.drawImage(
              img,
              i * nw * ratio,
              j * nh * ratio,
              nw * ratio,
              nh * ratio,
              0,
              0,
              nw,
              nh
            );
            ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
          }
        }
      } else {
        ctx.drawImage(img, 0, 0, width, height);
      }
      //修复ios上传图片的时候 被旋转的问题
      if (Orientation != "" && Orientation != 1) {
        switch (Orientation) {
          case 6: //需要顺时针（向左）90度旋转
            this.rotateImg(img, "left", canvas);
            break;
          case 8: //需要逆时针（向右）90度旋转
            this.rotateImg(img, "right", canvas);
            break;
          case 3: //需要180度旋转
            this.rotateImg(img, "right", canvas); //转两次
            this.rotateImg(img, "right", canvas);
            break;
        }
      }
      //进行最小压缩
      let ndata = canvas.toDataURL("image/jpeg", 0.1);
      console.log("压缩前：" + initSize);
      console.log("压缩后：" + ndata.length);
      console.log(
        "压缩率：" + ~~(100 * (initSize - ndata.length) / initSize) + "%"
      );
      tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
      var text = window.atob(ndata.split(",")[1]);
      var buffer = new ArrayBuffer(text.length);
      var ubuffer = new Uint8Array(buffer);
      var pecent = 0,
        loop = null;
      for (var i = 0; i < text.length; i++) {
        ubuffer[i] = text.charCodeAt(i);
      }
      var Builder = window.WebKitBlobBuilder || window.MozBlobBuilder;
      var blob;
      if (Builder) {
        var builder = new Builder();
        builder.append(buffer);
        blob = builder.getBlob(type);
      } else {
        blob = new window.Blob([buffer], { type: "image/png" });
      }
      return { blob: blob, ndata: ndata };
    },
    closeTip() {
      this.showAlert = false;
    }
  }
};
</script> 
<style scope>
@import url(./style/h5css/main.css);
* {
  margin: 0;
  padding: 0;
}
.show {
  width: 100px;
  height: 100px;
  overflow: hidden;
  position: relative;
  border-radius: 50%;
  border: 1px solid #d5d5d5;
}
.picture {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
}
.upload {
  line-height: 100%;
  text-align: center;
  overflow: hidden;
}
.upload img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
}
.mint-msgbox-message {
  color: #999;
  margin: 0.1rem 0px;
  text-align: center;
  font-size: 0.18rem;
  line-height: 36px;
}
.mint-msgbox {
  font-size: 18px;
  height: 12%;
}
.mint-msgbox-title {
  font-size: 0.2rem;
}
.mint-msgbox-confirm {
  font-size: 0.2rem;
  padding-top: 10px;
}
.el-message--warning {
  font-size: 0px;
}
.el-message {
  min-width: 480px;
}
.el-icon-warning:before {
    font-size: 0.2rem;
}
.el-message__content {
    font-size: 0.13rem;
}
</style>