<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'数据字典'">
                <div class="toolbar">
                    <vxe-button v-if="role >= 1 && role <= 2 && stationKey == '1379194999'" content="新增" @click="insertEvent(-1)"></vxe-button>
                </div>
            </NavModal>
            <div class="vex-table-box">
                <vxe-table
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData"
                    :edit-config="{trigger: 'click', mode: 'row',showStatus: true,activeMethod:activeCellMethod}"
                    @edit-closed="editClosedEvent">
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column field="type" title="类型" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="showName" title="显示名" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="createUser" title="创建人"></vxe-table-column>
                    <vxe-table-column field="createTime" title="创建时间"></vxe-table-column>
                    <vxe-table-column field="updateTime" title="更新时间"></vxe-table-column>
                    <vxe-table-column v-if="role >= 1 && role <= 2 && stationKey == '1379194999'" title="操作" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'删除','value':'remove'},{'label':'克隆','value':'clone'}]},events:{'clone':cloneData,'remove':removeSigleEvent}}"></vxe-table-column>
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
    name: "datatypedictionary",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            tableData: [],
            h: 300,
        };
    },
    created:function(){
        this.h = window.innerHeight - 100;
    },
    mounted:function(){
        this.getDataType();
    },
    methods:{
        activeCellMethod({row,column}){
            if(((this.role < 1 || this.role > 2) && this.stationKey == '1379194999') || this.stationKey != '1379194999'){
                return false;
            }
            return true;
        },
        cloneData({row}){
            console.log(row);
            this.$XModal.message({ message: '该功能研发中', status: 'warning' })
        },
        async insertEvent(row){
            let record = {
                'createUser': this.userName,
            }
            let { row: newRow } = await this.$refs.xTable.insertAt(record, row)
            await this.$refs.xTable.setActiveCell(newRow, 'type')
        },
        editClosedEvent({ row, column }){
            let xTable = this.$refs.xTable
            let field = column.property
            let cellValue = row[field]
            this.addDataType(row);
        },
        saveEvent(){
            const { insertRecords, removeRecords, updateRecords } = this.$refs.xTable.getRecordset()
            console.log(insertRecords);
        },
        removeEvent(){
            let selectRecords = this.$refs.xTable.getCheckboxRecords();
            if(!selectRecords.length){this.$XModal.message({ message: '请勾选列表', status: 'warning' });return;}
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeDataType(selectRecords[0]);
            }).catch(() => {});
        },
        removeSigleEvent({row}){
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeDataType(row);
            }).catch(() => {});
        },
        getDataType:async function(){
            let data=await api.getAxios('dataType');
            if(data.status == 200){
                data.data.map((item)=>{
                    item.createTime = ADS.getLocalTime(item.createTime);
                    item.updateTime = ADS.getLocalTime(item.updateTime);
                })
                this.tableData = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        addDataType:async function(row){
            let data=await api.postAxios('dataType',{typeKey:row._key, type:row.type, showName:row.showName, userKey:this.userId});
            if(data.status == 200){
                this.getDataType();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        removeDataType:async function(row){
            let data=await api.deleteAxios('dataType',{typeKey:row._key});
            if(data.status == 200){
                this.getDataType();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            role: state => state.nav.role,
            stationKey: state => state.nav.stationKey,
        })
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
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 80px);
            margin-top: 20px;
        }
    }
}
.toolbar{
    display: flex;
    align-items: center;
}
</style>

