<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'拍机列表'"></NavModal>
            <div class="select-wrap">
                <vxe-input v-model="genealogyName" placeholder="请输入谱名"></vxe-input>
                <vxe-select v-model="orgKey" placeholder="机构">
                    <vxe-option v-for="(item,index) in orgList" :key="'org'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-select v-model="status" placeholder="状态">
                    <vxe-option v-for="(item,index) in statusList" :key="'status'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-button status="primary" content="检索" @click="getTaskList"></vxe-button>
            </div>
            <div class="vex-table-box">
                <vxe-table
                    class="table-scrollbar"
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    :loading="loading"
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData">
                    <vxe-table-column field="orgName" title="机构"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="谱目"></vxe-table-column>
                    <vxe-table-column field="place" title="谱籍地"></vxe-table-column>
                    <vxe-table-column field="volume" title="应有卷数"></vxe-table-column>
                    <vxe-table-column field="actualVolumes" title="实拍卷数"></vxe-table-column>
                    <vxe-table-column field="totalPages" title="实拍页数"></vxe-table-column>
                    <vxe-table-column field="syncPages" title="同步页数"></vxe-table-column>
                    <vxe-table-column field="checkPages" title="通过页数"></vxe-table-column>
                    <vxe-table-column field="checkDoneTimeO" title="剩余天数"></vxe-table-column>
                    <vxe-table-column field="stageO" title="状态"></vxe-table-column>
                    <vxe-table-column v-if="role >= 1 && role <= 2" title="操作" width="75" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'删除','value':'remove'}]},events:{'remove':removeSigleEvent}}"></vxe-table-column>
                </vxe-table>
                <vxe-pager
                    :loading="loading"
                    :current-page="page"
                    :page-size="limit"
                    :total="total"
                    :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
                    @page-change="handlePageChange">
                </vxe-pager>
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
    name: "dorManage",
    components: {
        Sidebar,NavModal
    },
    data: () => {
        return {
            loading: false,
            tableData: [],
            page: 1,
            limit: 50,
            total: 0,
            orgList: [],
            orgKey: '',
            genealogyName: '',
            statusList: [{'label': '全部状态', 'value': ''},
            {'label': '已认领', 'value': 1},
            {'label': '待拍摄', 'value': 2},
            {'label': '拍摄中', 'value': 3},
            {'label': '自检完成', 'value': 4},
            {'label': '同步完成', 'value': 5},
            {'label': '审阅中', 'value': 6},
            {'label': '已打回', 'value': 7},
            {'label': '完成', 'value': 8},
            {'label': '已结算', 'value': 9}],
            status: '',
            stageO: {'null': '未认领', 'undefined': '未认领', '1': '已认领', '2': '待拍摄', '3': '拍摄中', '4': '自检完成', '5': '同步完成', '6': '审阅中', '7': '已打回', '8': '完成', '9': '已结算'},
        };
    },
    created:function(){
        this.h = window.innerHeight - 132 - 48;
    },
    mounted:function(){
        this.getOrgList();
        this.getTaskList();
    },
    methods:{
        async getOrgList(){// 机构列表
            let data = await api.getAxios('org?siteKey='+this.stationKey+'&name=');
            if(data.status == 200){
                this.orgList = data.data.map((ele, index)=>{
                    return {'label': ele.name, 'value': ele._key};
                });
                this.orgList.unshift({'label': '全部机构', 'value': ''});
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async getTaskList(){// 谱目列表
            this.loading = true;
            let data = await api.getAxios('dataWithDor?siteKey='+this.stationKey+'&genealogyName='+this.genealogyName+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status == 200){
                this.tableData = data.result.list.map((ele, index) => {
                    ele.stageO = this.stageO[ele.status];
                    return ele;
                });
                this.total = data.result.total;
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
        removeSigleEvent({row}){
            if(row.status){
                return this.$message({message: '您无权删除该家谱',type: 'warning'});
            }
            this.$confirm('此操作将永久删除该家谱, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // this.deleteGenealogy([row._key]);
            }).catch(() => {});
        },
        async deleteGenealogy(checkList){//删除
            let data = await api.deleteAxios('catalog',{'catalogKeyArr':checkList,'userKey':this.userId,'siteKey':this.stationKey});
            if(data.status == 200){
                this.getTaskList();
            }else{
                this.$message({message: '删除家谱出错，请重新删除',type: 'warning'});
            }
        },
        handlePageChange({ currentPage, pageSize }){
            this.page = currentPage;
            this.getTaskList();
        },
        navTo({row}){
            if(!row.dataNum){
                this.$XModal.message({message: '暂无关联家谱,无法查看', status: 'warning'});
                return false;
            }
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/dor/detail?dorKey='+row._key+'&name='+row.name);
        },
    },
    computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
        })
    },
    watch:{
        
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
            padding: 0 20px;
            height: calc(100% - 140px);
        }
    }
}
</style>

