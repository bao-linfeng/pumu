<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <div class="nav-wrap">
                <span class="title">拍机任务中心-审核</span>
            </div>
            <div class="content-wrap">
                <h3>谱目信息</h3>
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
                    :height="105"
                    :align="'center'"
                    :data="tableData">
                    <vxe-table-column field="_key" title="ID"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="资料名"></vxe-table-column>
                    <vxe-table-column field="place" title="谱籍地"></vxe-table-column>
                    <vxe-table-column field="volume" title="应有卷数"></vxe-table-column>
                    <vxe-table-column field="actualVolumes" title="实拍卷数"></vxe-table-column>
                    <vxe-table-column field="totalPages" title="实拍页数"></vxe-table-column>
                    <vxe-table-column field="submitTimeO" title="提交时间"></vxe-table-column>
                    <vxe-table-column field="checkDoneTimeO" title="剩余天数"></vxe-table-column>
                    <vxe-table-column field="clientUser" title="提交机构"></vxe-table-column>
                    <vxe-table-column v-if="role >= 1 && role <= 2" title="操作" width="180" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label': '审核通过', 'value': 'submit'},{'label': '打回', 'value': 'look'}]},events:{'submit': lookEvent, 'look': lookEvent}}"></vxe-table-column>
                </vxe-table>
            </div>
            <div class="vex-table-box">
                <h3>卷册信息</h3>
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
                    :data="volumeData">
                    <vxe-table-column field="_key" title="ID"></vxe-table-column>
                    <vxe-table-column field="volume" title="卷册"></vxe-table-column>
                    <vxe-table-column field="beginTimeO" title="开拍时间"></vxe-table-column>
                    <vxe-table-column field="takePages" title="实拍页数"></vxe-table-column>
                    <vxe-table-column field="doneTimeO" title="拍完时间"></vxe-table-column>
                    <vxe-table-column field="returnReason" title="打回原因"></vxe-table-column>
                    <vxe-table-column title="操作" width="120" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label': '审核', 'value': 'look'}]},events:{'look': lookEvent}}"></vxe-table-column>
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
            volumeData: [],
            catalogKey: '',
        };
    },
    created:function(){
        this.h = window.innerHeight - 60 - 150 - 48 - 25;
        this.catalogKey = ADS.getQueryVariable('key');
    },
    mounted:function(){
        this.getTaskDetail();
        this.getVolumeList();
    },
    methods:{
        async getTaskDetail(){// 任务详情
            this.loading = true;
            let data = await api.getAxios('review/task/detail?catalogKey='+this.catalogKey);
            this.loading = false;
            if(data.status == 200){
                data.data.clientUser = data.data.deviceInfo ? data.data.deviceInfo.clientUser : '';
                data.data.submitTimeO = data.data.submitTime ? ADS.getLocalTime(data.data.submitTime) : '';
                data.data.checkDoneTimeO = data.data.checkDoneTime ? (90 - (Date.now() - data.data.checkDoneTime)/1000/60/60/24).toFixed(2) : '';
                this.tableData =  [data.data];
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
        async getVolumeList(){// 卷册列表
            this.loading = true;
            let result = await api.getAxios('review/volume/list?catalogKey='+this.catalogKey);
            this.loading = false;
            if(result.status == 200){
                result.data.forEach((ele, i) => {
                    ele.volume = i + 1;
                    ele.beginTimeO = ADS.getLocalTime(ele.beginTime);
                    ele.doneTimeO = ADS.getLocalTime(ele.doneTime);
                });
                this.volumeData = result.data;
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
        lookEvent({row}){
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/dor/detail?dorKey='+row._key+'&name='+row.name);
        },
        handlePageChange({ currentPage, pageSize }){
            this.page = currentPage;
            this.getVolumeList();
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
        }
        .content-wrap{
            position: relative;
            width: calc(100% - 40px);
            padding: 10px 20px;
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 235px);
        }
    }
}
</style>

