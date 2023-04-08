<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'审核谱目'+(total ? '('+total+')' : '')">
                <div class="toolbar">
                    <!-- <vxe-button v-if="role >= 1 && role <= 3" content="删除脏数据" @click="removeSigleEvent({'row':{'hasMarkISGN':1,'batchID':''}})"></vxe-button> -->
                </div>
            </NavModal>
            <div class="select-wrap">
                <el-select class="w150" v-model="type" placeholder="请选择类型">
                    <el-option
                        v-for="item in dataType"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-date-picker
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                />
                <el-select class="w150" v-model="libListCheck" multiple placeholder="请选择机构序号">
                    <el-option
                        v-for="item in libList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select class="w150" v-model="stage" placeholder="风控决策阶段">
                    <el-option
                        v-for="item in stageArr"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-input class="w150" v-model="fileName" placeholder="文件标题"></el-input>
                <el-button type="primary" @click="refresh">检索</el-button>
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
                    :data="tableData"
                    :sort-config="{trigger: 'cell', orders: ['desc', 'asc', 'auto'], remote: true}"
                    @sort-change="sortChangeEvent"
                    >
                    <vxe-table-column field="fileName" title="文件标题" width="180"></vxe-table-column>
                    <!-- <vxe-table-column field="hasClean" title="清洗" width="80" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="hasCheckInBatch" title="自查重" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="hasCheckInISGN" title="大库查重" :edit-render="{name: '$select', options: stageState}"></vxe-table-column> -->
                    <!-- <vxe-table-column field="hasSubmitO" title="提交审核" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="needReviewO" title="打回" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="hasPast" title="通过审核" :edit-render="{name: '$select', options: stageState}"></vxe-table-column> -->
                    <vxe-table-column field="status" title="状态"></vxe-table-column>
                    <vxe-table-column field="excelDataNum" title="表格总数"></vxe-table-column>
                    <vxe-table-column field="dataNum" title="已导入数"></vxe-table-column>
                    <vxe-table-column field="hasMarkISGNNum" title="已入库数"></vxe-table-column>
                    <vxe-table-column field="libO" title="来源" sort-by="libCode" sortable></vxe-table-column>
                    <vxe-table-column field="checkUserName" title="审核人"></vxe-table-column>
                    <vxe-table-column field="createTime" title="导入时间" :formatter="['formatDate', '']" sort-by="createTime" sortable></vxe-table-column>
                    <vxe-table-column title="操作" width="260" :cell-render="{name:'AdaiActionButton',attr:{data:actionData},events:{'look':navTo,'download': downloadExcel, 'downloadNaturalExcel': downloadNaturalExcel}}"></vxe-table-column>
                </vxe-table>
                <vxe-pager
                    :loading="loading"
                    :current-page="page"
                    :page-size="pages"
                    :total="total"
                    :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Total']"
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
            stageArr: [
                {'label':'全部状态','value':''},
                // {'label':'已提交未审核','value':'unAudit'},
                {'label':'提交审核','value':'hasSubmit'},
                {'label':'打回','value':'needReview'},
                {'label':'审核通过','value':'hasPast'}
            ],
            batchId: '',
            batchArr:[],
            stageState:[{'label':'√','value':1},{'label':'','value':null},{'label':'','value':0}],
            actionData:[
                {'label':'查看','value':'look'},
                {'label':'修正Excel','value':'download'},
                {'label':'原始Excel','value':'downloadNaturalExcel'}
            ],
            page: 1,
            pages: 50,
            total:0,
            userList:[],
            userKey:'',
            loading: false,
            dataType: [],
            libList: [],
            libListCheck: [],
            time: '',
            startTime: '',
            endTime: '',
            fileName: '',
            sortField: '', 
            sortType: 'auto',
        };
    },
    created:function(){
        let search = window.location.search,param=ADS.params(search);
        this.h = window.innerHeight - 132 - 48;
        this.type = ADS.getQueryVariable('type') ? decodeURIComponent(ADS.getQueryVariable('type')) : '';
        this.fileName = ADS.getQueryVariable('fileName') ? decodeURIComponent(ADS.getQueryVariable('fileName')) : '';
        this.libListCheck = ADS.getQueryVariable('libListCheck') ? ADS.getQueryVariable('libListCheck').split(',') : '';
        this.startTime = ADS.getQueryVariable('startTime');
        this.endTime = ADS.getQueryVariable('endTime');
        this.stage = ADS.getQueryVariable('stage');
        this.page = ADS.getQueryVariable('page') ? Number(ADS.getQueryVariable('page')) : 1;
    },
    mounted:function(){
        this.role <=3  && this.role >=1 ? this.getUserList() : null;
        this.getDataType();
        this.getBatchList(); 
        this.getLibList();
        this.getBatch();
    },
    methods:{
        sortChangeEvent({column, property, order, sortBy, sortList, $event}){
            console.log(property, order, sortBy);
            this.sortField = sortBy;
            this.sortType = order;
            this.refresh();
        },
        async downloadExcel({row}){//下载excel
            let data = await api.postAxios('data/feedbackMark',{'batchKey':row._key});
            if(data.status == 200){
                ADS.downliadLink(data.result);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        downloadNaturalExcel({row}){
            console.log(row);
            if(row.uploadOriginalFileName){
                window.open(this.baseURL+'catalogFile/'+row.uploadOriginalFileName);
            }else{
                ADS.message('暂无原始Excel!');
            }
        },
        async getLibList(){
            let data = await api.getAxios('lib?siteKey='+this.stationKey);
            if(data.status == 200){
                let libList = [{'label':'全部机构序号','value':''}];
                data.data.map((item)=>{
                    libList.push({'label': item.libName+'('+item.libCode+')','value': item._key});
                });
                this.libList = libList;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        removeSigleEvent({row}){// 删除批次所有脏数据确认函数
            if(row.hasMarkISGN != 1){
                this.$XModal.message({ message: '该批次数据还没有入库，暂时无法删除脏数据', status: 'warning' });
                return false;
            }
            this.$confirm('此操作将永久删除该批次所有脏数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeBatchDirtyData(row.batchID);
            }).catch(() => {});
        },
        async removeBatchDirtyData(batchID){// 删除脏数据
            let data = await api.deleteAxios('dirty',{'batchKey':batchID,'siteKey':this.stationKey});
            if(data.status == 200){
                data.data && data.data.length ? this.$XModal.message({ message: (data.data.join(',')+'等批次未删除'), status: 'success' }) : null;
                this.getBatch();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
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
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/bookAuditList?batchID='+row._key+'&state='+state+'&f='+encodeURIComponent(row.fileName));
        },
        refresh(){// 刷新
            this.page = 1;
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
        async getBatch(){// 批次列表
            this.loading = true
            let data=await api.getAxios('batch?type='+this.type+'&sortField='+this.sortField+'&sortType='+this.sortType+'&fileName='+this.fileName+'&libListCheck='+this.libListCheck.join()+'&startTime='+this.startTime+'&endTime='+this.endTime+'&batchKey='+this.batchId+'&siteKey='+this.stationKey+'&stage='+this.stage+'&userKey='+this.userId+'&creator='+this.userKey+'&userRole='+this.role+'&page='+this.page+'&limit='+this.pages);
            if(data.status == 200){
                let excelDataNum = 0, dataNum = 0, hasMarkISGNNum = 0, arr = [];
                this.tableData = data.data.map((ele) => {
                    ele.libO = ele.lib+'('+ele.libCode+')';
                    excelDataNum = excelDataNum + ele.excelDataNum;
                    dataNum = dataNum + ele.dataNum;
                    hasMarkISGNNum = hasMarkISGNNum + ele.hasMarkISGNNum;

                    ele.hasSubmitO = ele.hasSubmit == 1 || (ele.repulseTime ? 1 : 0) || ele.hasPass == 1;
                    ele.needReviewO = ele.needReview == 1 && ele.hasPass != 1 && (ele.repulseTime ? 1 : 0);
                    ele.status = ele.hasPast ? '审核通过' : ele.needReviewO ? '打回' : ele.hasSubmitO ? '提交审核' : '待提交';

                    return ele;
                });
                
                this.tableData.push({'excelDataNum': excelDataNum, 'dataNum': dataNum, 'hasMarkISGNNum': hasMarkISGNNum, 'fileName': '本页小计'});
                this.total = data.total;
                this.loading = false;
                this.$router.push('/'+window.localStorage.getItem('pathname')+'/bookaudit?type='+this.type+'&fileName='+this.fileName+'&libListCheck='+this.libListCheck.join()+'&startTime='+this.startTime+'&endTime='+this.endTime+'&stage='+this.stage+'&page='+this.page);
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
            baseURL: state => state.nav.baseURL,
        })
    },
    watch:{
        'sumbmitNum': function(nv, ov){
            this.getBatch();
        },
        'time': function(nv, ov){
            if(nv){
                this.startTime = new Date(nv[0]).getTime();
                this.endTime = new Date(nv[1]).getTime();
            }else{
                this.startTime = '';
                this.endTime = '';
            }
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
.input{
    width: 150px;
    height: 30px;
    line-height: 30px;
    border: 1px solid #ddd;
    border-radius: 3px;
    text-indent: 10px;
    outline: none;
    margin-right: 10px;
}
.w150{
    width: 150px;
}
</style>

