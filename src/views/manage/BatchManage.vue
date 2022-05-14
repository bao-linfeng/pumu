<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'装载批次列表'+(total ? '('+total+')' : '')">
                <div class="toolbar">
                    <vxe-button v-if="role < 1 || role > 2" content="导入目录" @click="isLeadExcel=true"></vxe-button>
                    <vxe-button v-if="role >= 1 && role <= 2" content="删除脏数据" @click="removeSigleEvent({'row':{'hasMarkISGN':1,'batchID':''}})"></vxe-button>
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
                    <vxe-table-column title="操作" width="140" :cell-render="{name:'AdaiActionButton',attr:{data:actionData},events:{'look':navTo,'download':downloadExcel,'linkImage':linkImage}}"></vxe-table-column>
                </vxe-table>
            </div>
            <vxe-pager
                align="center"
                @page-change = "changePage"
                :current-page.sync="page"
                :page-size.sync="limit"
                :total="total"
                :layouts="['PrevJump', 'PrevPage', 'JumpNumber','NextPage', 'NextJump', 'Sizes', 'FullJump', 'Total']">
            </vxe-pager>
        </div>
        <LeadExcelModal v-if="isLeadExcel" v-on:close-lead-excel="closeLeadExcel" />
        <ExcelErrorModal v-if="isExcelError" :list="errorList" v-on:close-excel-error="closeExcelError" />
        <HasImageModal v-if="isLinkImage" :batchId="batchId" v-on:close-has-image="closeHasImage" />
        <div class="process-wrap" v-if="Upage && Upage < Utotal">
            <el-button class="reconnect" type="primary" @click="reconnect">重新连接</el-button>
            <el-progress type="circle" :percentage="Number((100*Upage/Utotal).toFixed(2))"></el-progress>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import LeadExcelModal from "../../components/batchManage/LeadExcelModal.vue";
import ExcelErrorModal from "../../components/batchManage/ExcelErrorModal.vue";
import HasImageModal from "../../components/batchManage/HasImageModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "batchmanage",
    components: {
        Sidebar,NavModal,LeadExcelModal,ExcelErrorModal,HasImageModal,
    },
    data: () => {
        return {
            tableData: [],
            dataType:[],
            type: '',
            fieldData:[],
            stage:'',
            stageArr:[{'label':'全部阶段','value':''},
            {'label':'数据清洗','value':'hasClean'},
            {'label':'完整性校验','value':'hasCheck'},
            {'label':'查重自审','value':'hasCheckInBatch'},
            {'label':'大库查重','value':'hasCheckInISGN'},
            {'label':'提交审核','value':'hasSubmit'},
            {'label':'审核通过','value':'hasPast'}],
            batchId:'',
            batchArr:[],
            isLeadExcel:false,
            stageState:[{'label':'√','value':1},{'label':'','value':null},{'label':'','value':0}],
            actionData:[{'label':'查看','value':'look'},{'label':'下载','value':'download'}],
            total:0,
            errorList:[],
            isExcelError:false,
            userList:[],
            userKey:'',
            isLinkImage: false,
            page: 1,
            limit: 20,
            total:0,
        };
    },
    created:function(){
        let search = window.location.search, param = ADS.params(search);
        this.h = window.innerHeight - 60 - 54 - 50;
    },
    mounted:function(){
        this.getDataType();
        this.role <=3  && this.role >=1 ? this.getUserList() : null;
        this.getBatchList(); 
        this.getBatch();
    },
    methods:{
        changePage({currentPage}){// 页码切换回调
            this.page = currentPage;
            this.getBatch();
        },
        async getDataType(){
            let data = await api.getAxios('dataType');
            if(data.status == 200){
                let dataType = [{'label':'全部','value':''}];
                data.data.map((item)=>{dataType.push({'label':item.showName,'value':item.type})});
                this.dataType = dataType;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        reconnect(){
            console.log('reconnect');
            this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
        },
        closeHasImage(flag){
            this.isLinkImage = false;
        },
        linkImage({row}){
            this.batchId = row.batchID;
            if(this.role >= 1 && this.role <= 2){
                this.isLinkImage = true;
            }else{
                this.$XModal.message({message: '您暂无权限', status: 'warning'})
            }
        },
        closeExcelError(){
            this.isExcelError = false;
        },
        navTo({row}){
            let state = 0;
            row.hasClean ? state = 1 : null;
            row.hasCheckInBatch ? state = 2 : null;
            row.hasCheckInISGN ? state = 3 : null;
            row.hasSubmit ? state = 4 : null;
            row.hasPast ? state = 5 : null;
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/batchdatastage?batchID='+row._key+'&state='+state);
        },
        async downloadExcel({row}){//下载excel
            if(row.hasPast == 1){
                let data = await api.postAxios('data/feedbackMark',{'batchKey':row._key});
                if(data.status == 200){
                    ADS.downliadLink(data.result);
                }else{
                    this.$XModal.message({ message: data.msg, status: 'warning' })
                }
            }else{
                this.$XModal.message({ message: '审核通过后才可下载', status: 'warning' })
            }
        },
        closeLeadExcel(data){// 关闭excel导入回调
            this.isLeadExcel = false;
            if(data.flag){
                this.isExcelError = data.arr.length ? true : false;
                this.errorList = data.arr;
                this.refresh();
                this.getUserList();
                this.getBatchList(); 
            }
        },
        refresh(){// 刷新
            this.getBatch();
        },
        removeBatchAll({row}){// 删除批次所有数据确认函数
            this.$confirm('此操作将永久删除该批次所有数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeBatchData(row);
            }).catch(() => {});
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
        async removeBatchData(row){// 删除该批次所有数据
            let data = await api.deleteAxios('batch',{'batch':row.batchID});
            if(data.status == 200){
                this.getBatch();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getUserList(){// 上传者
            let data = await api.getAxios('site/dataUser?siteKey='+this.stationKey);
            if(data.status && data.result){
                let userList = [{'label':'全部操作员','value':''}];
                data.result.map((item)=>{
                    userList.push({'label':item.userName,'value':item._key});
                });
                this.userList = userList;
            }
        },
        async getBatchList(){// 批次号列表
            let data = await api.getAxios('batch/simple?siteKey='+this.stationKey+'&userKey='+this.userKey+'&creator='+this.userKey+'&userRole='+this.role);
            if(data.status == 200){
                let batchArr = [{'label':'全部批次','value':''}];
                data.data.map((item)=>{batchArr.push({'label':item.batchID,'value':item._key})});
                this.batchArr = batchArr;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getBatch(){// 批次列表
            let data = await api.getAxios('batch?type='+this.type+'&libKey=&batchKey='+this.batchId+'&siteKey='+this.stationKey+'&stage='+this.stage+'&userKey='+this.userId+'&creator='+this.userKey+'&userRole='+this.role+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.tableData = data.data;
                this.total = data.total;
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
            Utotal: state => state.nav.Utotal,
            Upage: state => state.nav.Upage,
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
            .label{
                margin-right: 20px;
            }
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            // height: calc(100% - 140px);
        }
    }
}
.toolbar{
    display: flex;
    align-items: center;
}
.process-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}
.el-progress{
    // width: calc(100% - 40px);
}
.reconnect{
    position: absolute;
    top: 20px;
    right: 20px;
}
</style>

