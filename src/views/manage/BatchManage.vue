<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'装载批次列表'+(total ? '('+total+')' : '')">
                <div class="toolbar">
                    <el-button type="primary" @click="(isLeadExcel=true)">导入目录</el-button>
                    <!-- <vxe-button v-if="role >= 1 && role <= 3" content="删除脏数据" @click="removeSigleEvent({'row':{'hasMarkISGN':1,'batchID':''}})"></vxe-button> -->
                </div>
            </NavModal>
            <div class="select-wrap">
                <el-select class="width100" v-model="type" placeholder="按数据类型查询">
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
                <el-select class="width100" v-model="stage" placeholder="风控决策阶段">
                    <el-option
                        v-for="item in stageArr"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-input class="width100" v-model="fileName" placeholder="文件标题" @keyup.enter="refresh"></el-input>
                <el-button type="primary" @click="refresh">检索</el-button>
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
                    :sort-config="{trigger: 'cell', orders: ['desc', 'asc', 'auto'], remote: true}"
                    @sort-change="sortChangeEvent"
                    :data="tableData">
                    <vxe-table-column field="fileName" title="文件标题" width="200"></vxe-table-column>
                    <vxe-table-column field="hasSubmitO" title="提交审核" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="needReviewO" title="打回" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="hasPast" title="通过审核" :edit-render="{name: '$select', options: stageState}"></vxe-table-column>
                    <vxe-table-column field="excelDataNum" title="表格总数"></vxe-table-column>
                    <vxe-table-column field="dataNum" title="已导入数"></vxe-table-column>
                    <vxe-table-column field="hasMarkISGNNum" title="已入库数"></vxe-table-column>
                    <vxe-table-column field="libO" title="机构"></vxe-table-column>
                    <vxe-table-column field="createTime" title="导入时间" :formatter="['formatDate', '']" sort-by="createTime" sortable></vxe-table-column>
                    <vxe-table-column title="操作" width="300" :cell-render="{name:'AdaiActionButton',attr:{data:actionData},events:{'look':navTo,'download':downloadExcel, 'downloadNaturalExcel':downloadNaturalExcel, 'upload': uploadImage,'linkImage':linkImage}}"></vxe-table-column>
                </vxe-table>
            </div>
            <vxe-pager
                align="center"
                @page-change = "changePage"
                :current-page.sync="page"
                :page-size.sync="limit"
                :total="total"
                :layouts="['PrevJump', 'PrevPage', 'JumpNumber','NextPage', 'NextJump', 'FullJump', 'Total']">
            </vxe-pager>
        </div>
        <LeadExcelModal v-if="isLeadExcel" v-on:close-lead-excel="closeLeadExcel" />
        <ExcelErrorModal v-if="isExcelError" :list="errorList" v-on:close-excel-error="closeExcelError" />
        <HasImageModal v-if="isLinkImage" :batchId="batchId" v-on:close-has-image="closeHasImage" />
        <div class="process-wrap" v-if="Upage && Upage < Utotal">
            <el-button class="reconnect" type="primary" @click="reconnect">重新连接</el-button>
            <el-progress type="circle" :percentage="Number((100*Upage/Utotal).toFixed(2))"></el-progress>
        </div>
        <!-- 批次关联影像、审核时查看 -->
        <UploadImages v-if="isShow" :batchData="batchData" v-on:close="isShow = 0" />
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
import UploadImages from '../../components/batchManage/UploadImages.vue';
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "batchmanage",
    components: {
        Sidebar,NavModal,LeadExcelModal,ExcelErrorModal,HasImageModal, UploadImages, 
    },
    data: () => {
        return {
            tableData: [],
            dataType:[],
            type: '',
            fieldData:[],
            stage:'',
            stageArr:[{'label':'全部阶段','value':''},
            // {'label':'数据清洗','value':'hasClean'},
            // {'label':'完整性校验','value':'hasCheck'},
            // {'label':'查重自审','value':'hasCheckInBatch'},
            // {'label':'大库查重','value':'hasCheckInISGN'},
            {'label':'待提交','value': 'unSubmit'},
            {'label':'提交审核','value':'hasSubmit'},
            {'label':'打回','value':'needReview'},
            {'label':'审核通过','value':'hasPast'}],
            batchId:'',
            batchArr:[],
            isLeadExcel:false,
            stageState:[{'label':'√','value':1},{'label':'','value':null},{'label':'','value':0}],
            actionData:[
                {'label':'查看','value':'look'},
                {'label':'修正Excel','value':'download'}, 
                {'label':'原始Excel','value':'downloadNaturalExcel'}, 
                {'label':'上传', 'value':'upload'}
            ],
            total:0,
            errorList:[],
            isExcelError:false,
            userList:[],
            userKey:'',
            isLinkImage: false,
            page: 1,
            limit: 20,
            total:0,
            orgList: [],
            orgKey: '',
            libList: [],
            libListCheck: [],
            time: '',
            startTime: '',
            endTime: '',
            isShow: 0,
            batchData: {},
            fileName: '',
            sortField: '', 
            sortType: 'auto',
        };
    },
    created:function(){
        let search = window.location.search, param = ADS.params(search);
        this.h = window.innerHeight - 60 - 54 - 50;
        this.type = ADS.getQueryVariable('type') ? decodeURIComponent(ADS.getQueryVariable('type')) : '';
        this.fileName = ADS.getQueryVariable('fileName') ? decodeURIComponent(ADS.getQueryVariable('fileName')) : '';
        // this.libListCheck = ADS.getQueryVariable('libListCheck') ? ADS.getQueryVariable('libListCheck').split(',') : '';
        this.startTime = ADS.getQueryVariable('startTime');
        this.endTime = ADS.getQueryVariable('endTime');
        this.stage = ADS.getQueryVariable('stage');
        this.page = ADS.getQueryVariable('page') ? Number(ADS.getQueryVariable('page')) : 1;
    },
    mounted:function(){
        this.getDataType();
        // this.getUserList();
        this.getLibList();
        this.getBatchList(); 
        if(this.role <= 3  && this.role >=1){
            this.getOrgList();
        }else{
            this.orgKey = this.orgId;
        }
    },
    methods:{
        sortChangeEvent({column, property, order, sortBy, sortList, $event}){
            console.log(property, order, sortBy);
            this.sortField = sortBy;
            this.sortType = order || 'auto';
            this.refresh();
        },
        uploadImage({row}){
            this.batchData = row;
            this.isShow = 1;
        },
        async getLibList(){
            let data = await api.getAxios('lib?siteKey='+this.stationKey);
            if(data.status == 200){
                let libList = [{'label':'全部机构序号','value':''}];
                data.data.map((item)=>{
                    libList.push({'label': item.libCode,'value': item._key});
                    if(this.role >= 1 && this.role <= 3){

                    }else{
                        if(item.orgKey == this.orgId){
                            this.libListCheck = [item._key];
                        }
                    }
                });
                this.libList = libList;
                this.getBatch();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
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
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/batchdatastage?batchID='+row._key+'&state='+state+'&f='+encodeURIComponent(row.fileName));
        },
        async downloadExcel({row}){//下载excel
            let data = await api.postAxios('data/feedbackMark',{'batchKey':row._key});
            if(data.status == 200){
                ADS.downliadLink(data.result);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
            // if(row.hasPast == 1){
                
            // }else{
            //     this.$XModal.message({ message: '审核通过后才可下载', status: 'warning' })
            // }
        },
        downloadNaturalExcel({row}){
            console.log(row);
            if(row.uploadOriginalFileName){
                console.log('https://view.officeapps.live.com/op/view.aspx?src='+this.baseURL+'catalogFile/'+row.uploadOriginalFileName);
                // window.open(this.baseURL+'catalogFile/'+row.uploadOriginalFileName);
                window.open('https://view.officeapps.live.com/op/view.aspx?src='+this.baseURL+'catalogFile/'+row.uploadOriginalFileName);
            }else{
                ADS.message('暂无原始Excel!');
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
            this.page = 1;
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
            let data = await api.getAxios('site/dataUser?siteKey='+this.stationKey+'&orgKey='+this.orgKey);
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
            let data = await api.getAxios('batch?type='+this.type+'&sortField='+this.sortField+'&sortType='+this.sortType+'&fileName='+this.fileName+'&libListCheck='+this.libListCheck.join()+'&startTime='+this.startTime+'&endTime='+this.endTime+'&orgKey='+this.orgKey+'&batchKey='+this.batchId+'&siteKey='+this.stationKey+'&stage='+this.stage+'&userKey='+this.userId+'&creator=&userRole='+this.role+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.tableData = data.data.map((ele) => {
                    ele.libO = ele.lib+'('+ele.libCode+')';
                    ele.unSubmitO = ele.hasSubmit != 1 && (!ele.repulseTime ? 1 : 0);
                    ele.hasSubmitO = ele.hasSubmit == 1 || (ele.repulseTime ? 1 : 0) || ele.hasPass == 1;
                    ele.needReviewO = ele.needReview == 1 && ele.hasPass != 1 && (ele.repulseTime ? 1 : 0);
                    return ele;
                });
                this.total = data.total;
                this.$router.push('/'+window.localStorage.getItem('pathname')+'/batchmanage?type='+this.type+'&fileName='+this.fileName+'&startTime='+this.startTime+'&endTime='+this.endTime+'&stage='+this.stage+'&page='+this.page);
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
            orgId: state => state.nav.orgId,
            orgAdmin: state => state.nav.orgAdmin,
            baseURL: state => state.nav.baseURL,
        })
    },
    watch:{
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
.width100{
    width: 150px;
}
</style>

