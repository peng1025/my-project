<template>
  <div>
    <el-table ref="multipleTable" :data="tableData3" tooltip-effect="dark" border style="width: 80%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column label="日期" width="120">
        <template slot-scope="scope">{{ scope.row.date }}</template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="120">
      </el-table-column>
      <el-table-column prop="address" label="地址" show-overflow-tooltip>
      </el-table-column>
    </el-table>

    <div style="margin-top: 20px">
      <el-button @click="toggleSelection([tableData3[1], tableData3[2]])">切换第二、第三行的选中状态</el-button>
      <el-button @click="toggleSelection()">取消选择</el-button>
      <el-button type="primary" @click="dialogImportVisible = true">导入</el-button>
      <el-button type="primary" @click="outportData">导出</el-button>
    </div>

    <!-- 导入 -->
    <el-dialog title="导入" :visible.sync="dialogImportVisible" :modal-append-to-body="false" :close-on-click-modal="false" class="dialog-import">
      <el-upload v-loading="loading" element-loading-text="正在导入，请稍等" drag :action="importUrl" :show-file-list="false" :on-success="uploadSuccess" :on-error="uploadFail" :before-upload="beforeUpload">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">只能上传xls/xlsx文件，且不超过1000行</div>
      </el-upload>
      <!-- <div :class="{'import-content': importFlag === 1, 'hide-dialog': importFlag !== 1}">
        <el-upload class="upload-demo" :action="importUrl" :name="name" :headers="importHeaders" :on-preview="handlePreview" :on-remove="handleRemove" :before-upload="beforeUpload" :on-error="uploadFail" :on-success="uploadSuccess" :file-list="fileList" :with-credentials="withCredentials"> -->
      <!-- 是否支持发送cookie信息 -->
      <!-- <el-button size="small" type="primary" :disabled="processing">{{uploadTip}}</el-button>
          <div slot="tip" class="el-upload__tip">只能上传excel文件</div>
        </el-upload>
        <div class="download-template">
          <a class="btn-download" @click="download">
            <i class="icon-download"></i>下载模板</a>
        </div>
      </div>
      <div :class="{'import-failure': importFlag === 2, 'hide-dialog': importFlag !== 2}">
        <div class="failure-tips">
          <i class="el-icon-warning"></i>导入失败</div>
        <div class="failure-reason">
          <h4>失败原因</h4>
          <ul>
            <li v-for="(error,index) in errorResults" :key="index">第{{error.rowIdx + 1}}行，错误：{{error.column}},{{error.value}},{{error.errorInfo}}</li>
          </ul>
        </div>
      </div> -->
    </el-dialog>

    <!-- 导出 -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData3: [
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-08",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-06",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        },
        {
          date: "2016-05-07",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄"
        }
      ],
      importUrl: "/api/importOrder", //后台接口config.admin_url+'rest/schedule/import/'
      dialogImportVisible: false,
      loading: false
    };
  },

  methods: {
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      //复选框选择回填函数,val返回一整行的数据
      this.multipleSelection = val;
    },
    importData() {},
    outportData() {
      this.ajax("订单导出", {}, (ret, err) => {
        if (ret === null) {
          this.$message({
            message: err.msg,
            type: "error"
          });
        } else {
          const blob = new Blob([ret.data]);
          if ("download" in document.createElement("a")) {
            // 非IE下载
            const elink = document.createElement("a");
            elink.download = ret.filename;
            elink.style.display = "none";
            elink.href = URL.createObjectURL(blob);
            document.body.appendChild(elink);
            elink.click();
            URL.revokeObjectURL(elink.href); // 释放URL 对象
            document.body.removeChild(elink);
          } else {
            // IE10+下载
            navigator.msSaveBlob(blob, ret.filename);
          }
        }
      });
    },
    handlePreview(file) {
      //可以通过 file.response 拿到服务端返回数据
    },
    handleRemove(file, fileList) {
      //文件移除
    },
    //上传之前
    beforeUpload() {
      this.loading = true;
      debugger;
    },
    //上传错误
    uploadFail(err, file, fileList) {
      this.loading = false;
      this.$message.error(err);
    },
    //上传成功
    uploadSuccess(response, file, fileList) {
      this.loading = false;
      if (response.code === 200) {
        this.$message({
          type: "success",
          message: "导入成功"
        });
      } else {
        this.$message({
          type: "success",
          message: "导入失败，请重试。错误信息：" + response.msg
        });
      }
    },

    //下载模板
    download() {
      //调用后台模板方法,和导出类似
      scheduleApi.downloadTemplate();
    }
  }
};
</script>

<style scoped>
.hide-dialog {
  display: none;
}
</style>