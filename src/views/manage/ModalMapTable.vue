<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'模板定义'">
                <div class="toolbar">
                    <vxe-button v-if="role >= 1 && role <= 2" content="新增" @click="insertEvent(-1)"></vxe-button>
                    <vxe-button icon="fa fa-save" content="刷新" @click="refresh"></vxe-button>
                </div>
            </NavModal>
            <div class="select-wrap">
                <vxe-select v-model="type" placeholder="数据类型">
                    <vxe-option v-for="(item,index) in dataType" :key="'type'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-select v-model="libKey" placeholder="数据源">
                    <vxe-option v-for="(item,index) in lib" :key="'lib'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-select v-model="templateKey" placeholder="模板">
                    <vxe-option v-for="(item,index) in template" :key="'template'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-button v-if="role >= 1 && role <= 2" content="克隆模板" @click="templateCopy" :style="{'margin-left':'10px'}"></vxe-button>
            </div>
            <div class="vex-table-box">
                <vxe-table
                    ref="xTable"
                    :align="'center'"
                    :data="tableData"
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    row-key
                    :height="h"
                    :edit-config="{trigger: 'click', mode: 'row',showStatus: true, activeMethod:activeCellMethod}"
                    @edit-closed="editClosedEvent">
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column field="columnName" title="模板表头" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="fieldKey" title="对应字段" :edit-render="{name: '$select', options: field}"></vxe-table-column>
                    <vxe-table-column field="createUser" title="创建人"></vxe-table-column>
                    <vxe-table-column field="createTime" title="创建时间"></vxe-table-column>
                    <vxe-table-column type="html" title="拖动" field="move" width="60"></vxe-table-column>
                    <vxe-table-column v-if="role >= 1 && role <= 2" title="操作" width="200" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'删除','value':'remove'}]},events:{'remove':removeSigleEvent}}"></vxe-table-column>
                </vxe-table>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "modalmaptable",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            type:'',
            dataType:[],
            tableData: [],
            libKey:'',
            lib:[],
            templateKey:'',
            template:[],
            field:[],
            isFirst:true,
            h:100,
        };
    },
    created:function(){
        let search = window.location.search,param = ADS.params(search);
        this.type = param['type'] ? decodeURIComponent(param['type']) : '';
        this.libKey = param['libKey'];
        this.templateKey = param['id'];
        this.h = window.innerHeight - 134;
    },
    mounted:function(){
        this.getDataType();
        this.rowDrop();
    },
    methods:{
        rowDrop () {
            this.$nextTick(() => {
                let xTable = this.$refs.xTable
                this.sortable = Sortable.create(xTable.$el.querySelector('.vxe-table tbody'), {
                    handle: '.drag-btn',
                    onEnd: ({ newIndex, oldIndex }) => {
                        let sortArr = [];
                        let currRow = this.tableData.splice(oldIndex, 1)[0]
                        this.tableData.splice(newIndex, 0, currRow)
                        this.tableData.map((item)=>{sortArr.push(item._key)})
                        console.log(sortArr);
                        if(sortArr.length){
                            this.orderField(sortArr);
                        }
                        
                    }
                })
            })
        },
        async orderField(arr){
            let data = await api.patchAxios('templateDetail/order',{templateKey:this.templateKey,detailKeyArr:arr});
            if(data.status != 200){
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        activeCellMethod({row,column}){//控制编辑
            if(this.role < 1 || this.role > 2){
                return false;
            }
            return true;
        },
        refresh(){
            this.getTemplateDetail();
        },
        async insertEvent(row){
            let record = {
                'createUser': this.userName,
            }
            let { row: newRow } = await this.$refs.xTable.insertAt(record, row)
            await this.$refs.xTable.setActiveCell(newRow, 'type')
        },
        editClosedEvent({ row, column }){
            this.addTemplateDetail(row);
        },
        removeSigleEvent({row}){
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeTemplateDetail(row);
            }).catch(() => {});
        },
        removeEvent(){
            let selectRecords = this.$refs.xTable.getCheckboxRecords();
            if(!selectRecords.length){this.$XModal.message({ message: '请勾选列表', status: 'warning' });return;}
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeTemplateDetail(selectRecords[0]);
            }).catch(() => {});
        },
        copy({row}){
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/modalmaptable?id='+row._key);
        },
        async getDataType(){
            let data = await api.getAxios('dataType');
            if(data.status == 200){
                let dataType = [];
                data.data.map((item)=>{dataType.push({'label':item.showName,'value':item.type})});
                this.dataType = dataType;
                this.getLib();
                this.getField();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getField(){
            let data = await api.getAxios('field?type='+this.type);
            if(data.status == 200){
                let field = [];
                data.data.map((item)=>{field.push({'label':item.fieldName+'('+item.fieldMeans+')','value':item._key})});
                this.field = field;
                this.getLib();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getLib(){
            let data = await api.getAxios('lib?siteKey='+this.stationKey);
            if(data.status == 200){
                let lib = [];
                data.data.map((item)=>{lib.push({'label':item.libName,'value':item._key})});
                this.lib = lib;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getTemplate(){
            let data = await api.getAxios('template?type='+this.type+'&libKey='+this.libKey+'&siteKey='+this.stationKey);
            if(data.status == 200){
                let template = [];
                data.data.map((item)=>{template.push({'label':item.templateName,'value':item._key})});
                this.isFirst ? null : this.templateKey = template.length ? template[0].value : '';
                this.isFirst = false;
                this.template = template;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getTemplateDetail(){
            let data = await api.getAxios('template/detail?templateKey='+this.templateKey);
            if(data.status == 200){
                data.data.map((item)=>{
                    item.move = "<img class='drag-btn' title='拖动' src='"+require('../../assets/cnki/drag.svg')+"' />";
                    item.createTime = ADS.getLocalTime(item.createTime);
                })
                this.tableData = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async addTemplateDetail(row){
            let data = await api.postAxios('template/detail',{detailKey:row._key, templateKey:this.templateKey, fieldKey:row.fieldKey, columnName:row.columnName,userKey:this.userId});
            if(data.status == 200){
                this.getTemplateDetail();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async removeTemplateDetail(row){
            let data = await api.deleteAxios('template/detail',{detailKey:row._key});
            if(data.status == 200){
                this.getTemplateDetail();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async templateCopy(){
            let data = await api.postAxios('template/copy',{templateKey:this.templateKey, libKey:this.libKey, type:this.type, userKey:this.userId});
            if(data.status == 200){
                this.isFirst = true;
                this.templateKey = data.templateKey;
                this.getTemplate();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
        })
    },
    watch:{
        'type':function(newV,oldV){
            this.isFirst ? null : this.getTemplate()
        },
        'libKey':function(newV,oldV){
            this.getTemplate();
        },
        'templateKey':function(newV,oldV){
            newV ? this.getTemplateDetail() : this.tableData = [];
        },
    },
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    width: calc(100% - 200px);
    height: 100%;
    padding-left: 200px;
    text-align: left;
    .content{
        position: relative;
        width: 100%;
        height: calc(100% - 20px);
        background: #EFF1F5;
        padding-bottom: 20px;
        .select-wrap{
            padding: 10px 20px;
            width: calc(100% - 40px);
            display: flex;
            align-items: center;
        }
        .vex-table-box{
            width: calc(100% - 40px);
            height: calc(100% - 120px);
            margin: 0 auto;
        }
    }
}
.toolbar{
    height: 100%;
    line-height: 100%;
    display: flex;
    align-items: center;
}
</style>

