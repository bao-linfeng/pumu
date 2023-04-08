<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'数据源模板'">
                <div class="toolbar">
                    <vxe-button v-if="role >= 1 && role <= 2" content="新增" @click="insertEvent(-1)"></vxe-button>
                    <vxe-button content="刷新" @click="refresh"></vxe-button>
                </div>
            </NavModal>
            <div class="select-wrap">
                <vxe-select v-model="type" placeholder="按数据类型查询">
                    <vxe-option v-for="(item,index) in dataType" :key="'type'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
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
                    :edit-config="{trigger: 'click', mode: 'row',showStatus: true,activeMethod:activeCellMethod}"
                    @edit-closed="editClosedEvent">
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column field="type" title="类型" :edit-render="{name: '$select', options: dataType}"></vxe-table-column>
                    <vxe-table-column field="libKey" title="数据源" :edit-render="{name: '$select', options: lib}"></vxe-table-column>
                    <vxe-table-column field="orgKey" title="机构" :edit-render="{name: '$select', options: orgList}"></vxe-table-column>
                    <vxe-table-column field="templateName" title="模板名称" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="createUser" title="创建人"></vxe-table-column>
                    <vxe-table-column field="createTime" title="创建时间"></vxe-table-column>
                    <vxe-table-column title="操作" :width="w" :cell-render="{name:'AdaiActionButton',attr:{data: actionData},events:{'check':checkEvent,'clone':cloneEvent,'remove':removeSigleEvent}}"></vxe-table-column>
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
    name: "datasourcemodal",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            type: '',
            dataType: [],
            tableData: [],
            libKey: '',
            lib: [],
            h: 300,
            actionData: [{'label':'查看','value':'check'}],
            w: 80,
            orgList: [],
        };
    },
    created:function(){
        this.h = window.innerHeight - 134;
        if(this.role >= 1 && this.role <= 2){
            this.w = 200;
            this.actionData = [{'label':'查看','value':'check'},{'label':'克隆','value':'clone'},{'label':'删除','value':'remove'}];
        }
    },
    mounted:function(){
        this.getDataType();
        this.getLib();
        this.getOrgList();
    },
    methods:{
        getOrgList:async function(){
            let data = await api.getAxios('org?siteKey='+this.stationKey+'&name=');
            if(data.status == 200){
                let orgList = [{'label':'全部','value':''}];
                data.data.map((item)=>{
                    orgList.push({'label': item.name,'value': item._key});
                });
                this.orgList = orgList;
            }else{
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
            this.getTemplate();
        },
        async insertEvent(row){
            let record = {
                'createUser': this.userName,
            }
            let { row: newRow } = await this.$refs.xTable.insertAt(record, row)
            await this.$refs.xTable.setActiveCell(newRow, 'type')
        },
        editClosedEvent({ row, column }){
            this.addTemplate(row);
        },
        removeSigleEvent({row}){
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeTemplate(row);
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
                this.removeTemplate(selectRecords[0]);
            }).catch(() => {});
        },
        checkEvent({row}){
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/datasourcemodal/maptable?id='+row._key+'&libKey='+row.libKey+'&type='+row.type);
        },
        cloneEvent({row}){
            this.$confirm('此操作将克隆该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.templateCopy(row);
            }).catch(() => {});
        },
        async templateCopy(row){
            let data = await api.postAxios('template/copy',{templateKey:row._key, libKey:row.libKey, type:this.type, userKey:this.userId});
            if(data.status == 200){
                this.getTemplate();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getDataType(){
            let data = await api.getAxios('dataType');
            if(data.status == 200){
                let dataType = [];
                data.data.map((item)=>{dataType.push({'label':item.showName,'value':item.type})});
                this.type = dataType[0].value;
                this.dataType = dataType;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getLib(){
            let data = await api.getAxios('lib?siteKey='+this.stationKey);
            if(data.status == 200){
                let lib = [];
                data.data.map((item)=>{lib.push({'label':item.libName,'value':item._key})});
                this.libKey = lib[0].value;
                this.lib = lib;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getTemplate(){
            let data = await api.getAxios('template?type='+this.type+'&siteKey='+this.stationKey);
            if(data.status == 200){
                data.data.map((item)=>{
                    item.createTime = ADS.getLocalTime(item.createTime);
                })
                this.tableData = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async addTemplate(row){
            let data = await api.postAxios('template',{'orgKey': row.orgKey, templateKey:row._key,libKey:row.libKey, templateName:row.templateName,type:row.type,userKey:this.userId,siteKey:this.stationKey});
            if(data.status == 200){
                this.getTemplate();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async removeTemplate(row){
            let data = await api.deleteAxios('template',{templateKey:row._key});
            if(data.status == 200){
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
            this.getTemplate();
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
        .toolbar{
            display: flex;
            align-items: center;
        }
        .select-wrap{
            padding: 10px 20px;
            width: calc(100% - 40px);
        }
        .vex-table-box{
            width: calc(100% - 40px);
            height: calc(100% - 120px);
            margin: 0 auto;
        }
    }
}
</style>

