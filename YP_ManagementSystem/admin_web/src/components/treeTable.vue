<template>
  <div>
    <el-table :data="tableData" tooltip-effect="dark" border @selection-change="handleSelectionChange" highlight-current-row max-height="600" size="mini" @current-change="currentChange" :row-style="showTr" :row-class-name="tableRowClassName">
      <el-table-column v-if="options.selection" type="selection" width="55">
      </el-table-column>
      <template v-for="(item,index) in tableFormat">
        <el-table-column v-if="index === 0" :label="item.label" :width="item.width" show-overflow-tooltip>
          <template slot-scope="scope">
            <p :style="'text-indent:'+(scope.row._level+1)+'em;position:relative'">
              <template v-if="scope.row.IsLeaf">
                <i v-if="!scope.row._expanded" @click="toggle(scope.row,scope.$index)" class="el-icon-arrow-right expanded-icon"></i>
                <i v-else @click="toggle(scope.row,scope.$index)" class="el-icon-arrow-down expanded-icon"></i>
              </template>
              <span v-html="scope.row.Title"></span>
            </p>
          </template>
        </el-table-column>
        <el-table-column v-else-if="item.html" :label="item.label" :width="item.width" show-overflow-tooltip>
          <template slot-scope="scope">
            <div v-html="scope.row[item.prop]"></div>
          </template>
        </el-table-column>
        <el-table-column v-else :prop="item.prop" :label="item.label" :width="item.width" show-overflow-tooltip>
        </el-table-column>
      </template>
      <el-table-column v-if="options.button" label="操作" :width="72*options.maxButtons" fixed="right">
        <template slot-scope="scope">
          <el-button-group>
            <template v-for="b in scope.row.buttons">
              <template v-if="b.show">
                <el-button v-if="show[b.show]" :type="b.type" :icon="b.icon" :title="b.title" @click="fun(b.fun,scope.row,scope.$index)"></el-button>
              </template>
              <template v-else>
                <el-button :type="b.type" :icon="b.icon" :title="b.title" @click="fun(b.fun,scope.row,scope.$index)"></el-button>
              </template>
            </template>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  props: {
    tableFormat: {
      type: Array,
      default: function() {
        return [];
      }
    },
    data: {
      type: Array,
      default: function() {
        return [];
      }
    },
    options: {
      type: Object,
      default: function() {
        //参数名称         类型       描述
        //accurateSearch  bool       是否精准查询
        //search          bool       是否为查询
        //nodeOpenClick   string     点击展开事件名称。
        return {};
      }
    },
    show: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {};
  },
  computed: {
    tableData: function() {
      let data = [];
      for (let item of this.data) {
        let obj = { ...item };
        data.push(obj);
      }
      let dataList = [];
      if (this.options.accurateSearch) {
        dataList = data;
      } else {
        dataList = this.formatTreeTable(data, 0, 0, null, this.options.open);
      }
      this.options.tableCache = dataList;
      return dataList;
    }
  },
  methods: {
    fun(emit, row, index) {
      this.$emit(emit, row, index);
    },
    currentChange(val) {
      this.$emit("current-change", val);
    },
    tableRowClassName({ row, rowIndex }) {
      //把每一行的索引放进row
      row.index = rowIndex;
    },
    handleSelectionChange(val) {
      if (this.options.selection) {
        let idArr = [];
        let indexArr = [];
        for (let i in val) {
          idArr.push(val[i].ID);
          for (let j in this.data) {
            if (this.data[j].ID === val[i].ID) {
              indexArr.push(j);
            }
          }
        }
        this.options.multipleSelectionIndex = indexArr;
        this.options.multipleSelection = idArr;
      }
    },
    // 显示行
    showTr(data, index) {
      if (data.row.ID == 21074) {
        debugger;
      }
      let row = data.row;
      let show = row._parent
        ? row._parent._expanded && row._parent._show
        : true;
      row._show = show;
      return show ? "" : "display:none;";
    },
    toggle(row, index) {
      let temp = !this.tableData[index]._expanded;
      this.$set(this.tableData[index], "_expanded", temp);
      this.$set(this.options.tableCache[index], "_expanded", temp);
      if (temp && !row.isClick && !this.options.search) {
        this.$set(this.options.tableCache[index], "isClick", true);
        this.$emit(
          this.options.nodeOpenClick,
          row,
          index,
          this.options.tableCache
        );
      }
    },
    formatTreeTable(data, pid = 0, level = 0, parent = null, open = false) {
      let temp = [];
      for (let item of data) {
        if (item.Pid === pid) {
          item._level = level;
          item._expanded = open
            ? open
            : item._expanded === undefined ? false : item._expanded;
          if (parent === null) {
            item._show = true;
          } else {
            parent.isparent = true;
            item._show = open
              ? open
              : item._show === undefined ? false : item._show;
            item._parent = parent;
          }
          temp.push(item);
          let children = this.formatTreeTable(
            data,
            item.ID,
            level + 1,
            item,
            this.options.open
          );
          temp = temp.concat(children);
        }
      }
      return temp;
    }
  }
};
</script>
<style lang="less" scoped>
.el-table {
  border-radius: 10px;
}
.el-table th {
  background-color: #ffc33d;
  color: #fff;
}
.expanded-icon {
  position: absolute;
  line-height: 23px;
  left: -1em;
  cursor: pointer;
  color: #409eff;
}
</style>
