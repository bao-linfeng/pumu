<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'DOR关联家谱'"></NavModal>
            <div class="select-wrap">
                <vxe-input v-model="genealogyName" placeholder="谱名"></vxe-input>
                <vxe-select v-model="orgKey" placeholder="机构">
                    <vxe-option v-for="(item,index) in orgList" :key="'org'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-select v-model="linkDor" placeholder="关联状态">
                    <vxe-option v-for="(item,index) in linkDorList" :key="'linkDor'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-button status="primary" content="检索" @click="getDataWithDor"></vxe-button>
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
                    <vxe-table-column field="surname" title="姓氏"></vxe-table-column>
                    <vxe-table-column field="place" title="谱籍地"></vxe-table-column>
                    <vxe-table-column field="hall" title="堂号"></vxe-table-column>
                    <vxe-table-column field="authors" title="作者"></vxe-table-column>
                    <vxe-table-column field="linkDor" title="状态" formatter="formatLinkDor"></vxe-table-column>
                    <vxe-table-column v-if="role >= 1 && role <= 2" field="day" type="html" title="天数"></vxe-table-column>
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
            actionData: [{'label':'查看', 'value':'look'}],
            page: 1,
            pages: 1,
            limit: 50,
            total: 0,
            linkDorList: [{'label':'全部','value':''},{'label':'未关联','value': 0},{'label':'已关联','value': 1}],
            linkDor: '',
            orgList: [],
            orgKey: '',
            genealogyName: '',
        };
    },
    created:function(){
        this.h = window.innerHeight - 132 - 48;
    },
    mounted:function(){
        this.getOrgList();
        this.getDataWithDor();
    },
    methods:{
        removeSigleEvent({row}){
            if(row.status){
                return this.$message({message: '您无权删除该家谱',type: 'warning'});
            }
            this.$confirm('此操作将永久删除该家谱, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteGenealogy([row._key]);
            }).catch(() => {});
        },
        deleteGenealogy:async function(checkList){//删除
            let data=await api.deleteAxios('catalog',{'catalogKeyArr':checkList,'userKey':this.userId,'siteKey':this.stationKey});
            if(data.status == 200){
                this.getDataWithDor();
            }else{
                this.$message({message: '删除家谱出错，请重新删除',type: 'warning'});
            }
        },
        getOrgList:async function(){
            let data=await api.getAxios('org?siteKey='+this.stationKey+'&name=');
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
        handlePageChange({ currentPage, pageSize }){
            this.page = currentPage;
            this.getDataWithDor();
        },
        navTo({row}){
            if(!row.dataNum){
                this.$XModal.message({message: '暂无关联家谱,无法查看', status: 'warning'});
                return false;
            }
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/dor/detail?dorKey='+row._key+'&name='+row.name);
        },
        getDataWithDor:async function(){
            this.loading = true;
            let data = await api.getAxios('dataWithDor?siteKey='+this.stationKey+'&genealogyName='+this.genealogyName+'&orgKey='+this.orgKey+'&linkDor='+this.linkDor+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                let tableData = data.result.list,day = '';
                tableData.map((item) => {
                    day = item.passTime && !item.linkDor ? Math.ceil((Date.now() - item.passTime)/1000/60/60/24) : '';
                    item.day = day >= 90 && !item.linkDor ? ('<span class="red">'+day+'</span>') : !item.linkDor && day < 90 ? day : '';
                    item.status = day >= 90 && !item.linkDor ? 0 : 1;
                    // console.log(item.day);
                });
                this.tableData = tableData;
                this.total = data.result.total;
                this.loading = false;
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
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

