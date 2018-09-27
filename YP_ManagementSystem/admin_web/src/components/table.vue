<template>
  <div>
    <el-table :data="data" tooltip-effect="dark" border @selection-change="handleSelectionChange" :row-style="showTr">
    <el-table-column v-if="options.selection" type="selection" width="55">
    </el-table-column>
    <template v-for="item in tableFormat">
      <el-table-column :prop="item.prop" :label="item.label" :width="item.width" show-overflow-tooltip>
      </el-table-column>
    </template>
    <el-table-column v-if="options.button" label="操作" :width="buttonWeight" fixed="right">
      <template slot-scope="scope">
        <el-button-group>
          <template v-for="b in scope.row.buttons">
            <template v-if="b.show">
              <el-button  v-if="show[b.show]" :type="b.type" :icon="b.icon" :title="b.title" @click="fun(b.fun,scope.row,scope.$index)">{{b.text}}</el-button>
            </template>
            <template v-else>
              <el-button :type="b.type" :icon="b.icon" :title="b.title" @click="fun(b.fun,scope.row,scope.$index)">{{b.text}}</el-button>
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
  mounted() {},
  computed: {
    buttonWeight: function() {
      return !!this.options.buttonText
        ? 100 * this.options.maxButtons
        : 72 * this.options.maxButtons;
    }
  },
  methods: {
    fun(emit, row, index) {
      this.$emit(emit, row, index);
    },
    // 合计行高亮显示
    showTr(data) {
      return this.options.summary
        ? data.rowIndex === 0 ? "background-color: #ecf5ff;" : ""
        : "";
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
</style>
