<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <div class="nav-wrap">
                <span class="title">拍机任务中心</span>
                <div class="search-wrap">
                    <vxe-select v-model="searchField" placeholder="状态">
                        <vxe-option v-for="(item,index) in searchFieldList" :key="'searchField'+index" :value="item.value" :label="item.label"></vxe-option>
                    </vxe-select>
                    <vxe-input v-model="searchValue" placeholder="输入关键字"></vxe-input>
                    <vxe-button status="primary" content="检索" @click="getTaskList"></vxe-button>
                </div>
            </div>
            <div class="step-wrap">
                <div class="step-box" :class="{active: stage === index+1}" v-for="(item, index) in stageList" :key="index" @click="changeStage(index+1)">
                    <img :src="require('../../assets/shoot/'+index+(stage === index+1 ? '_a' : '')+'.svg')" alt="">
                    <p>{{item.name}}</p>
                </div>
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
                    <vxe-table-column field="_key" title="ID"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="资料名"></vxe-table-column>
                    <vxe-table-column field="place" title="谱籍地"></vxe-table-column>
                    <vxe-table-column field="volume" title="应有卷数"></vxe-table-column>
                    <vxe-table-column v-if="stage >= 2" field="actualVolumes" title="实拍卷数"></vxe-table-column>
                    <vxe-table-column v-if="stage >= 2" field="totalPages" title="实拍页数"></vxe-table-column>
                    <!-- <vxe-table-column field="totalPages" title="实拍页数"></vxe-table-column>
                    <vxe-table-column field="syncPages" title="同步页数"></vxe-table-column>
                    <vxe-table-column field="checkPages" title="通过页数"></vxe-table-column> -->
                    <vxe-table-column v-if="stage == 1" field="checkDoneTimeL" title="查重完成日"></vxe-table-column>
                    <vxe-table-column v-if="stage == 2" field="claimTimeO" title="领取时间"></vxe-table-column>
                    <vxe-table-column v-if="stage == 3" field="submitTimeO" title="提交时间"></vxe-table-column>
                    <vxe-table-column field="checkDoneTimeO" title="剩余天数"></vxe-table-column>
                    <vxe-table-column v-if="stage <= 2" field="orgO" title="来源机构"></vxe-table-column>
                    <vxe-table-column v-if="stage == 2" field="clientUser" title="领取机构"></vxe-table-column>
                    <vxe-table-column v-if="stage == 3" field="clientUser" title="提交机构"></vxe-table-column>
                    <vxe-table-column v-if="role >= 1 && role <= 2 && stage == 1" title="操作" width="150" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label': '设为公共任务', 'value': 'setCommon'}]},events:{'setCommon': setCommonEvent}}"></vxe-table-column>
                    <vxe-table-column v-if="stage == 2" field="stageO" title="任务状态"></vxe-table-column>
                    <vxe-table-column v-if="role >= 1 && role <= 2 && stage == 3" title="操作" width="120" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label': '查看详情', 'value': 'look'}]},events:{'look': lookEvent}}"></vxe-table-column>
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
            limit: 20,
            total: 0,
            stageO: {'null': '未认领', 'undefined': '未认领', '1': '已认领', '2': '待拍摄', '3': '拍摄中', '4': '自检完成', '5': '同步完成', '6': '审阅中', '7': '已打回', '8': '完成', '9': '已结算'},
            stageList: [{'status': 0, 'name': '未领取'},
            {'status': 1, 'name': '已领取'},
            {'status': 2, 'name': '待审核'},
            {'status': 3, 'name': '已打回'},
            {'status': 4, 'name': '已完成'},
            {'status': 5, 'name': '结算中心'}],
            stage: 1,
            searchFieldList: [{'label': '全部', 'value': ''},
            {'label': 'ID', 'value': '_key'},
            {'label': '谱名', 'value': 'genealogyName'},
            {'label': '谱籍地', 'value': 'place'}],
            searchField: '',
            searchValue: '',
            orgList: [],
            orgKey: '',
        };
    },
    created:function(){
        this.h = window.innerHeight - 60 - 150 - 48;
    },
    mounted:function(){
        this.getTaskList();
    },
    methods:{
        changeStage(i){
            this.stage = i;
            this.getTaskList();
        },
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
            let data = await api.getAxios('review/task/list?siteKey='+this.stationKey+'&stage='+this.stage+'&searchField='+this.searchField+'&searchValue='+this.searchValue+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status == 200){
                this.tableData = data.result.list.map((ele, index) => {
                    ele.checkDoneTimeL = ele.checkDoneTime ? ADS.getLocalTime(ele.checkDoneTime) : '';
                    ele.checkDoneTimeO = ele.checkDoneTime ? (90 - (Date.now() - ele.checkDoneTime)/1000/60/60/24).toFixed(2) : '';
                    ele.stageO = this.stageO[ele.takeStatus];
                    ele.orgO = ele.orgName || ele.creatorName;
                    ele.claimTimeO = ele.claimTime ? ADS.getLocalTime(ele.claimTime) : '';
                    ele.clientUser = ele.deviceInfo ? ele.deviceInfo.clientUser : '';
                    ele.submitTimeO = ele.submitTime ? ADS.getLocalTime(ele.submitTime) : '';
                    return ele;
                });
                this.total = data.result.total;
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
        setCommonEvent({row}){
            if(row.checkDoneTimeO < 0){

            }else{
                ADS.message('您无权设置');
            }
        },
        lookEvent({row}){
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/cameraDetail?key='+row._key);
        },
        removeSigleEvent({row}){
            // if(row.status){
            //     return this.$message({message: '您无权删除该家谱',type: 'warning'});
            // }
            // this.$confirm('此操作将永久删除该家谱, 是否继续?', '提示', {
            //     confirmButtonText: '确定',
            //     cancelButtonText: '取消',
            //     type: 'warning'
            // }).then(() => {
            //     // this.deleteGenealogy([row._key]);
            // }).catch(() => {});
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
        .nav-wrap{
            position: relative;
            width: calc(100% - 40px);
            padding: 0 20px;
            height: 60px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .title{
                font-weight: bold;
            }
            .search-wrap{
                position: relative;
                display: flex;
                align-items: center;
            }
        }
        .step-wrap{
            position: relative;
            width: calc(100% - 40px);
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            color: #666;
            .step-box{
                position: relative;
                cursor: pointer;
                &::after{
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 4px;
                    border-radius: 2px;
                    background: #358BCD;
                    display: none;
                }
                &.active{
                    color: #358BCD;
                    &::after{
                        display: block;
                    }
                }
            }
        }
        .select-wrap{
            padding: 10px 20px;
            width: calc(100% - 40px);
            display: flex;
            align-items: center;
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 210px);
        }
    }
}
</style>

