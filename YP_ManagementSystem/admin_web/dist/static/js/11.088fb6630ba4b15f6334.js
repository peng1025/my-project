webpackJsonp([11],{"8o0B":function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var i=a("Dd8w"),o=a.n(i),n=a("BO1k"),r=a.n(n),s=Vue.filter("formatDate"),d={data:function(){return{dataList:[],dataCount:0,tableFormat:[{prop:"Name",label:"项目名称"},{prop:"CreateTimeStr",label:"创建时间",width:"180"}],options:{button:!0,buttonText:!0,maxButtons:1},tableLoading:!1,addFormVisible:!1,editFormVisible:!1,pageindex:1,pagesize:10,addform:{name:""},editform:{id:"",name:""},activeIndex:"",rules:{name:[{required:!0,message:"请输入项目名称",trigger:"blur"},{max:20,message:"项目名称不能超过 20 个字符",trigger:"blur"}]},loadingBtnState:{addState:!1,editState:!1}}},created:function(){this.init()},methods:{init:function(){this.ifshow(this.show),this.getDataList()},getDataList:function(){var t=this;this.tableLoading=!0;var e={start:(this.pageindex-1)*this.pagesize,size:this.pagesize};this.ajax("项目列表",e,function(e,a){t.tableLoading=!1,null===e?t.$message({message:a.msg,type:"error"}):(t.dataList=e.data.result,t.dataCount=e.data.count)})},currentChange:function(t){this.pageindex=t||1,this.getDataList()},resetForm:function(t){this.$refs[t].resetFields()},addHandle:function(){var t=this;this.$refs.addform.validate(function(e){if(!e)return!1;t.loadingBtnState.addState=!0,t.ajax("添加项目",t.addform,function(e,a){t.loadingBtnState.addState=!1,null===e?t.$message({message:a.msg,type:"error"}):(t.addFormVisible=!1,t.$message({type:"success",message:"添加成功!"}),t.getDataList())})})},editBefore:function(t,e){this.activeIndex=e,this.editform.id=t.ID,this.editform.name=t.Name,this.editFormVisible=!0},checkChange:function(){var t=this.dataList[this.activeIndex],e=this.editform;return t.Name===e.name&&t.ID===e.id&&(this.resetForm("editform"),this.activeIndex="",this.editFormVisible=!1,!0)},editHandle:function(){var t=this;this.$refs.editform.validate(function(e){if(!e)return!1;t.checkChange()||(t.loadingBtnState.editState=!0,t.ajax("编辑项目",t.editform,function(e,a){t.loadingBtnState.editState=!1,null===e?t.$message({message:a.msg,type:"error"}):(t.editFormVisible=!1,t.dataList[t.activeIndex].Name=t.editform.name,t.resetForm("editform"),t.activeIndex="",t.$message({type:"success",message:"修改成功!"}))}))})}},computed:{tableData:function(){var t=[],e=!0,a=!1,i=void 0;try{for(var n,d=r()(this.dataList);!(e=(n=d.next()).done);e=!0){var l=n.value,c=o()({},l);c.CreateTimeStr=s(c.CreateTime),c.buttons=[{type:"primary",icon:"el-icon-edit",title:"编辑项目",text:"编辑",fun:"editBefore"}],t.push(c)}}catch(t){a=!0,i=t}finally{try{!e&&d.return&&d.return()}finally{if(a)throw i}}return t}}},l={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"border pd10"},[a("el-row",[a("el-col",{staticClass:"pd10",attrs:{span:24}},[a("el-button",{attrs:{type:"success",icon:"el-icon-plus"},on:{click:function(e){t.addFormVisible=!0}}},[t._v("添加项目")])],1)],1),t._v(" "),a("el-row",{directives:[{name:"loading",rawName:"v-loading",value:t.tableLoading,expression:"tableLoading"}]},[a("el-col",{staticClass:"pd10",attrs:{span:24}},[a("my-table",{attrs:{tableFormat:t.tableFormat,data:t.tableData,options:t.options},on:{editBefore:t.editBefore}}),t._v(" "),a("el-pagination",{attrs:{align:"center",background:"","current-page":t.pageindex,"page-size":t.pagesize,layout:"total, prev, pager, next",total:t.dataCount},on:{"current-change":t.currentChange}})],1)],1),t._v(" "),a("el-dialog",{attrs:{title:"添加项目",visible:t.addFormVisible},on:{"update:visible":function(e){t.addFormVisible=e},close:function(e){t.resetForm("addform")}}},[a("el-form",{ref:"addform",attrs:{model:t.addform,rules:t.rules,"label-width":"80px"}},[a("el-form-item",{attrs:{label:"项目名称",prop:"name"}},[a("el-input",{model:{value:t.addform.name,callback:function(e){t.$set(t.addform,"name",e)},expression:"addform.name"}})],1)],1),t._v(" "),a("div",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{on:{click:function(e){t.addFormVisible=!1}}},[t._v("取 消")]),t._v(" "),a("el-button",{attrs:{type:"primary",loading:t.loadingBtnState.addState},on:{click:t.addHandle}},[t._v("保 存")])],1)],1),t._v(" "),a("el-dialog",{attrs:{title:"编辑项目",visible:t.editFormVisible},on:{"update:visible":function(e){t.editFormVisible=e},close:function(e){t.resetForm("editform")}}},[a("el-form",{ref:"editform",attrs:{model:t.editform,rules:t.rules,"label-width":"80px"}},[a("el-form-item",{attrs:{label:"姓名",prop:"name"}},[a("el-input",{model:{value:t.editform.name,callback:function(e){t.$set(t.editform,"name",e)},expression:"editform.name"}})],1)],1),t._v(" "),a("div",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{on:{click:function(e){t.editFormVisible=!1}}},[t._v("取 消")]),t._v(" "),a("el-button",{attrs:{type:"primary",loading:t.loadingBtnState.editState},on:{click:t.editHandle}},[t._v("保 存")])],1)],1)],1)},staticRenderFns:[]};var c=a("VU/8")(d,l,!1,function(t){a("jeeY")},"data-v-0ce84511",null);e.default=c.exports},Dd8w:function(t,e,a){"use strict";e.__esModule=!0;var i,o=a("woOf"),n=(i=o)&&i.__esModule?i:{default:i};e.default=n.default||function(t){for(var e=1;e<arguments.length;e++){var a=arguments[e];for(var i in a)Object.prototype.hasOwnProperty.call(a,i)&&(t[i]=a[i])}return t}},R4wc:function(t,e,a){var i=a("kM2E");i(i.S+i.F,"Object",{assign:a("To3L")})},To3L:function(t,e,a){"use strict";var i=a("lktj"),o=a("1kS7"),n=a("NpIQ"),r=a("sB3e"),s=a("MU5D"),d=Object.assign;t.exports=!d||a("S82l")(function(){var t={},e={},a=Symbol(),i="abcdefghijklmnopqrst";return t[a]=7,i.split("").forEach(function(t){e[t]=t}),7!=d({},t)[a]||Object.keys(d({},e)).join("")!=i})?function(t,e){for(var a=r(t),d=arguments.length,l=1,c=o.f,u=n.f;d>l;)for(var f,m=s(arguments[l++]),g=c?i(m).concat(c(m)):i(m),p=g.length,v=0;p>v;)u.call(m,f=g[v++])&&(a[f]=m[f]);return a}:d},V3tA:function(t,e,a){a("R4wc"),t.exports=a("FeBl").Object.assign},jeeY:function(t,e){},woOf:function(t,e,a){t.exports={default:a("V3tA"),__esModule:!0}}});