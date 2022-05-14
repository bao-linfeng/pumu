<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'数据源'">
                <div class="toolbar">
                    <vxe-button v-if="role >= 1 && role <= 2" content="新增" @click="insertEvent(-1)"></vxe-button>
                    <vxe-button content="刷新" @click="refresh"></vxe-button>
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
                    row-key
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData"
                    :edit-config="{trigger: 'click', mode: 'row',showStatus: true,activeMethod:activeCellMethod}"
                    @edit-closed="editClosedEvent">
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column field="libCode" title="简称" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="libName" title="来源" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="createUser" title="创建人"></vxe-table-column>
                    <vxe-table-column field="createTime" title="创建时间"></vxe-table-column>
                    <vxe-table-column v-if="role >= 1 && role <= 2" title="操作" width="80" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'删除','value':'remove'}]},events:{'remove':removeSigleEvent}}"></vxe-table-column>
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
    name: "datasource",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            tableData: [],
            h:300,
        };
    },
    created:function(){
        this.h = window.innerHeight - 100;
    },
    mounted:function(){
        this.getLib();
    },
    methods:{
        activeCellMethod({row,column}){//控制编辑
            if(this.role < 1 || this.role > 2){
                return false;
            }
            return true;
        },
        refresh(){
            this.getLib();
        },
        async insertEvent(row){
            let record = {
                'createUser': this.userName,
            }
            let { row: newRow } = await this.$refs.xTable.insertAt(record, row)
            await this.$refs.xTable.setActiveCell(newRow, 'type')
        },
        editClosedEvent({ row, column }){
            this.addLib(row);
        },
        removeSigleEvent({row}){
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeLib(row);
            }).catch(() => {});
        },
        removeEvent(){
            let selectRecords = this.$refs.xTable.getCheckboxRecords();
            if(!selectRecords.length){this.$XModal.message({ message: '请勾选列表', status: 'warning' });return;}
            console.log(selectRecords);
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeLib(selectRecords[0]);
            }).catch(() => {});
        },
        async getLib(){
            let data = await api.getAxios('lib?siteKey='+this.stationKey);
            if(data.status == 200){
                data.data.map((item)=>{
                    item.createTime = ADS.getLocalTime(item.createTime);
                })
                this.tableData = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async addLib(row){
            let data = await api.postAxios('lib',{libKey:row._key,libCode:row.libCode, libName:row.libName,userKey:this.userId,siteKey:this.stationKey});
            if(data.status == 200){
                this.getLib();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async removeLib(row){
            let data = await api.deleteAxios('lib',{libKey:row._key});
            if(data.status == 200){
                this.getLib();
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
        .vex-table-box{
            width: calc(100% - 40px);
            height: calc(100% - 140px);
            margin: 20px auto 0 auto;
        }
    }
}
</style>

