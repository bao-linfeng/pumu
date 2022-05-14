<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'审核谱目'+(total ? '('+total+')' : '')">
                <div class="toolbar">
                    <vxe-button content="刷新" @click="refresh"></vxe-button>
                </div>
            </NavModal>
            <div class="select-wrap">
                <vxe-select v-model="type" placeholder="按数据类型查询">
                    <vxe-option v-for="(item,index) in dataType" :key="'type'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-select v-if="role >= 1 && role <= 2" v-model="userKey" placeholder="操作员">
                    <vxe-option v-for="(item,index) in userList" :key="'site'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-select v-model="stage" placeholder="风控决策阶段">
                    <vxe-option v-for="(item,index) in stageArr" :key="'risk'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-select v-model="batchId" placeholder="批次号">
                    <vxe-option v-for="(item,index) in batchArr" :key="'batchid'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-button content="检索" @click="getBatch"></vxe-button>
            </div>
            <div class="vex-table-box">
                <vxe-table
                    class="table-scrollbar"
                    :loading="loading"
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData">
                    <vxe-table-column field="batchID" title="批次" width="120"></vxe-table-column>
                    <vxe-table-column field="hasClean" title="清洗" width="80" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="hasCheckInBatch" title="自查重" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="hasCheckInISGN" title="大库查重" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="hasSubmit" title="提交审核" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="needReview" title="打回" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="hasPast" title="通过审核" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="excelDataNum" title="表格总数"></vxe-table-column>
                    <vxe-table-column field="dataNum" title="已导入数"></vxe-table-column>
                    <vxe-table-column field="hasMarkISGNNum" title="已入库数"></vxe-table-column>
                    <vxe-table-column field="lib" title="数据源"></vxe-table-column>
                    <vxe-table-column field="templateName" title="模板"></vxe-table-column>
                    <vxe-table-column field="fileName" title="文件标题"></vxe-table-column>
                    <vxe-table-column field="createUser" title="操作员"></vxe-table-column>
                    <vxe-table-column field="createTime" title="导入时间" :formatter="['formatDate', '']"></vxe-table-column>
                    <vxe-table-column title="操作" width="80" :cell-render="{name:'AdaiActionButton',attr:{data:actionData},events:{'look':navTo}}"></vxe-table-column>
                </vxe-table>
                <vxe-pager
                    :loading="loading"
                    :current-page="page"
                    :page-size="pages"
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
    name: "bookAudit",
    components: {
        Sidebar,NavModal
    },
    data: () => {
        return {
            type:'',
            tableData: [],
            stage: '',
            stageArr:[
                {'label':'全部','value':''},
            {'label':'提交审核','value':'hasSubmit'},
            {'label':'审核通过','value':'hasPast'}],
            batchId:'',
            batchArr:[],
            stageState:[{'label':'√','value':1},{'label':'','value':null},{'label':'','value':0}],
            actionData:[{'label':'查看','value':'look'}],
            page: 1,
            pages: 50,
            total:0,
            userList:[],
            userKey:'',
            loading: false,
            dataType: [],
        };
    },
    created:function(){
        let search = window.location.search,param=ADS.params(search);
        this.h = window.innerHeight - 132 - 48;
    },
    mounted:function(){
        this.role <=3  && this.role >=1 ? this.getUserList() : null;
        this.getDataType();
        this.getBatchList(); 
        this.getBatch();
    },
    methods:{
        getDataType:async function(){
            let data=await api.getAxios('dataType');
            if(data.status == 200){
                let dataType = [{'label':'全部','value':''}];
                data.data.map((item)=>{dataType.push({'label':item.showName,'value':item.type})});
                this.dataType = dataType;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        navTo({row}){
            let state = 0;
            row.hasClean ? state = 1 : null;
            row.hasCheckInBatch ? state = 2 : null;
            row.hasCheckInISGN ? state = 3 : null;
            row.hasSubmit ? state = 4 : null;
            row.hasPast ? state = 5 : null;
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/bookAuditList?batchID='+row._key+'&state='+state);
        },
        refresh(){// 刷新
            this.getBatch();
        },
        getUserList:async function(){// 上传者
            let data=await api.getAxios('site/dataUser?siteKey='+this.stationKey);
            if(data.status && data.result){
                let userList = [{'label':'全部操作员','value':''}];
                data.result.map((item)=>{
                    userList.push({'label':item.userName,'value':item._key});
                });
                this.userList = userList;
            }
        },
        getBatchList:async function(){// 批次号列表
            let data=await api.getAxios('batch/simple?siteKey='+this.stationKey+'&userKey='+this.userKey);
            if(data.status == 200){
                let batchArr = [{'label':'全部批次','value':''}];
                data.data.map((item)=>{batchArr.push({'label':item.batchID,'value':item._key})});
                this.batchArr = batchArr;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        handlePageChange({ currentPage, pageSize }){
            console.log(currentPage);
            this.page = currentPage;
            this.getBatch();
        },
        getBatch:async function(){// 批次列表
            this.loading = true
            let data=await api.getAxios('batch?type='+this.type+'&libKey=&batchKey='+this.batchId+'&siteKey='+this.stationKey+'&stage='+this.stage+'&userKey='+this.userId+'&creator='+this.userKey+'&userRole='+this.role+'&page='+this.page+'&limit='+this.pages);
            if(data.status == 200){
                this.tableData = data.data;
                this.total = data.total;
                this.loading = false
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
            sumbmitNum: state => state.nav.sumbmitNum,
        })
    },
    watch:{
        'sumbmitNum': function(nv, ov){
            this.getBatch();
        }
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
            .label{
                margin-right: 20px;
            }
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 140px);
        }
    }
}
.toolbar{
    display: flex;
    align-items: center;
}
</style>

