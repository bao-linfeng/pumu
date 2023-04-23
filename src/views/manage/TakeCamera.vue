<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <div class="nav-wrap">
                <span class="title">影像审核-任务列表</span>
                <div class="head-right">
                    <el-button type="primary" size="medium" @click="openStatistics">工作量统计</el-button>
                    <el-button v-if="stage == 13 && orgAdmin == 'admin' && hasRoot" type="primary" size="medium" @click="handleUpdateVolumeProperty">批量修改卷册信息</el-button>
                    <el-button v-if="stage == 13 && orgAdmin == 'admin' && hasRoot" type="primary" size="medium" @click="patchTaskVerify">批量审核通过</el-button>
                </div>
            </div>
            <div class="search-wrap">
                <el-input class="width100" v-model="gcKey" placeholder="请输入谱ID" @change="getTaskListAll"></el-input>
                <el-input class="width100" v-model="genealogyName" placeholder="请输入谱名" @change="getTaskListAll"></el-input>
                <el-input class="width100" v-model="volumeKey" placeholder="请输入卷ID" @change="getTaskListAll"></el-input>
                <el-select class="width100" v-model="GCOver" placeholder="编目状态">
                    <el-option
                        v-for="item in GCOverList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select class="width100" v-if="this.role <=3  && this.role >=1" v-model="orgListCheck" multiple placeholder="所属机构">
                    <el-option
                        v-for="item in orgList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-input class="width100" v-model="checker" placeholder="审核人" @change="getTaskListAll"></el-input>
                <el-button type="primary" size="medium" @click="getTaskListAll">检索</el-button>
                <el-checkbox class="marginL10" v-model="isShowSearch">展开</el-checkbox>
            </div>
            <div class="search-wrap" v-show="isShowSearch">
                <el-select v-if="stage >= 2" class="width100" v-model="singleOrTwo" placeholder="拍数">
                    <el-option
                        v-for="item in singleOrTwoList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select v-if="stage >= 2" class="width100" v-model="isLeadImages" placeholder="影像类型">
                    <el-option
                        v-for="item in isLeadImagesList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-date-picker
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    start-placeholder="审核开始时间"
                    end-placeholder="审核结束时间"
                />
                <el-date-picker
                    v-model="createTime"
                    type="daterange"
                    unlink-panels
                    start-placeholder="卷册创建开始时间"
                    end-placeholder="卷册创建结束时间"
                />
            </div>
            <div class="step-wrap">
                <div class="step-box" :class="{active: stage == item.stage}" v-for="(item, index) in stageList" :key="index" @click="changeStage(item.stage)">
                    <img :src="require('../../assets/shoot/'+item.img+(stage == item.stage ? '_a' : '')+'.svg')" alt="">
                    <p>{{item.name}}({{tmpObject[item.stage]}})</p>
                </div>
            </div>
            <div class="vex-table-box" :class="{active: isShowSearch}" v-if="isTable">
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
                    :data="tableData"
                    :row-class-name="rowClassName"
                    @checkbox-all="selectAllEvent"
                    @checkbox-change="selectChangeEvent"
                    :sort-config="{trigger: 'cell', orders: ['desc', 'asc', 'auto'], remote: true}"
                    @sort-change="sortChangeEvent"
                    >
                    <vxe-table-column v-if="stage == 13 && orgAdmin == 'admin'" type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column field="_key" title="谱ID"></vxe-table-column>
                    <vxe-table-column v-if="stage == 2" field="claimTimeO" title="领取时间"></vxe-table-column>
                    <vxe-table-column v-if="stage == 5" field="beginTimeO" title="拍摄时间"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="谱名" sort-by="genealogyName" sortable></vxe-table-column>
                    <vxe-table-column v-if="stage == 1" field="place" title="谱籍地"></vxe-table-column>
                    <vxe-table-column field="volume" title="卷(册)说明"></vxe-table-column>
                    <vxe-table-column v-if="stage >= 2" field="volumeKey" title="卷ID"></vxe-table-column>
                    <vxe-table-column v-if="stage >= 2" field="internalSerialNumber" title="序号"></vxe-table-column>
                    <vxe-table-column v-if="stage >= 2" field="volumeNumber" title="卷名"></vxe-table-column>
                    <!-- <vxe-table-column v-if="stage >= 2" field="takePages" title="实拍页数"></vxe-table-column> -->
                    <vxe-table-column v-if="stage >= 2" field="syncPages" title="同步页数"></vxe-table-column>
                    <vxe-table-column field="organizationNo" title="来源" sort-by="organizationNo" sortable></vxe-table-column>
                    <!-- <vxe-table-column v-if="stage >= 3" field="singleOrTwoO" title="单双页"></vxe-table-column>
                    <vxe-table-column v-if="stage >= 3" field="isLeadImagesO" title="电子谱"></vxe-table-column> -->

                    <vxe-table-column v-if="stage == 1" field="checkDoneTimeL" title="查重完成日"></vxe-table-column>
                    <vxe-table-column v-if="stage == 1" field="checkDoneTimeO" title="剩余天数"></vxe-table-column>
                    
                    <vxe-table-column v-if="stage == 2" field="clientUser" title="领取人"></vxe-table-column>
                    <vxe-table-column v-if="stage == 1" field="fileName" title="文件标题"></vxe-table-column>
                    <vxe-table-column v-if="stage == 1" field="claimUserName" title="认领人"></vxe-table-column>
                    <vxe-table-column v-if="stage == 1" field="claimTimeO" title="认领时间"></vxe-table-column>
                    <vxe-table-column v-if="stage == 2" field="stageO" title="任务状态"></vxe-table-column>
                    <!-- <vxe-table-column v-if="stage >= 3" field="clientUser" title="提交人"></vxe-table-column> -->
                    <vxe-table-column v-if="stage == 3 || stage == 5 || stage == 14 || stage == 15" field="passUserName" title="审核人"></vxe-table-column>
                    <vxe-table-column v-if="stage == 4" field="returnReason" title="打回原因"></vxe-table-column>
                    <vxe-table-column v-if="stage == 14" field="returnReason" title="原因说明"></vxe-table-column>
                    <vxe-table-column v-if="stage == 4" field="passUserName" title="打回人"></vxe-table-column>
                    <vxe-table-column v-if="stage == 17" field="toVoidUserName" title="作废人"></vxe-table-column>

                    <vxe-table-column v-if="stage == 13" field="submitTimeO" title="拍机提交时间" sort-by="passTime" sortable></vxe-table-column>
                    <vxe-table-column v-if="stage == 3" field="passTimeOrgAdminO" title="审核时间" sort-by="passTime" sortable></vxe-table-column>
                    <vxe-table-column v-if="stage == 5 || stage == 14 || stage == 15" field="passTimeL" title="审核时间" sort-by="passTime" sortable></vxe-table-column>
                    <vxe-table-column v-if="stage == 4" field="returnTimeO" title="审核时间" sort-by="passTime" sortable></vxe-table-column>
                    <vxe-table-column v-if="stage == 17" field="toVoidTimeO" title="审核时间" sort-by="passTime" sortable></vxe-table-column>
                    <vxe-table-column v-if="stage >= 3" field="createTimeO" title="创建时间" sort-by="createTime" sortable></vxe-table-column>
                    <vxe-table-column v-if="stage >= 3" title="操作" width="200" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label': stage == 4 || stage == 5 || stage == 17 ? '影像' : '影像', 'value': 'look'}, {'label': '家谱', 'value': 'jiapu'}, {'label': '记录', 'value': 'log'}]},events:{'look': lookEvent, 'jiapu': getCatalogStatisticsData, 'log': handleLog}}"></vxe-table-column>
                </vxe-table>
                <div class="page-foot">
                    <div class="page-foot-left" v-show="stage >= 3">
                        <p v-if="pageTotal">本页影像汇总：{{pageTotal}}</p>
                        <p v-if="allTotal">总影像汇总：{{allTotal}}</p>
                    </div>
                    <vxe-pager
                        :loading="loading"
                        :current-page="page"
                        :page-size="limit"
                        :total="total"
                        :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Total']"
                        @page-change="handlePageChange">
                    </vxe-pager>
                </div>
            </div>
        </div>
        <!-- 'Sizes', -->
        <BillModule v-if="isBill" v-on:close="isBill = false" />
        <!-- <CatalogCount v-if="isShow == 1" :dataKey="dataKey" v-on:close="isShow = 0" /> -->
        <CatalogView v-if="isShow == 1" :read="false" :dataKey="dataKey" :vid="vid" v-on:close="isShow = 0" />
        <!-- 批量修改卷册属性 -->
        <UpdateVolumeProperty v-if="(isShow ==  2)" :list="selectRecords" v-on:close="(isShow = 0)" v-on:save="saveData" />
        <Loading v-show="loading" />
        <!-- 记录 -->
        <LogModule v-if="isShow == 3" :id="vid" v-on:close="isShow = 0" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import BillModule from '../../components/takeCamera/BillModule.vue';
import CatalogCount from '../../components/takeCamera/CatalogCount.vue';
import CatalogView from '../../components/takeCamera/CatalogView.vue';
import UpdateVolumeProperty from '../../components/takeCamera/UpdateVolumeProperty.vue';
import LogModule from '../../components/takeCamera/logModule.vue';
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "takeCamera",
    components: {
        Sidebar,NavModal, BillModule, CatalogCount, CatalogView, UpdateVolumeProperty, LogModule,
    },
    data: () => {
        return {
            loading: false,
            tableData: [],
            page: 1,
            limit: 20,
            total: 0,
            stageO: {'null': '未认领', 'undefined': '未认领', '1': '已认领', '2': '待拍摄', '3': '拍摄中', '4': '自检完成', '5': '同步完成', '6': '审阅中', '7': '已打回', '8': '完成', '9': '已结算', '16': '作废'},
            stageList: [
                {'status': 0, 'name': '未拍摄', 'stage': '1', 'img': '0'},
                {'status': 1, 'name': '已领取', 'stage': '2', 'img': '1'},
                {'status': 2, 'name': '机构审核', 'stage': '13', 'img': '2'},
                {'status': 2, 'name': '微站初审', 'stage': '3', 'img': '2'},
                {'status': 2, 'name': '微站复审', 'stage': '14', 'img': '2'},
                {'status': 2, 'name': '微站待议', 'stage': '15', 'img': '2'},
                {'status': 3, 'name': '已打回', 'stage': '4', 'img': '3'},
                {'status': 4, 'name': '已完成', 'stage': '5', 'img': '4'},
                {'status': 5, 'name': '作废', 'stage': '17', 'img': '5'},
            ],
            stage: 1,
            searchFieldList: [
                {'label': '全部', 'value': ''},
                {'label': '谱ID', 'value': '_key'},
                {'label': '谱名', 'value': 'genealogyName'},
                {'label': '谱籍地', 'value': 'place'}
            ],
            searchField: '',
            searchValue: '',
            genealogyName: '',
            gcKey: '',
            place: '',
            singleOrTwo: '',
            singleOrTwoList: [
                {'label': '全部拍数', 'value': ''},
                {'label': '单拍', 'value': '1'},
                {'label': '双拍', 'value': '2'}
            ],
            isLeadImages: '',
            isLeadImagesList: [
                {'label': '影像类型', 'value': ''},
                {'label': '纸谱', 'value': '0'},
                {'label': '电子谱', 'value': '1'}
            ],
            GCOverList: [
                {'label': '完结状态', 'value': ''},
                {'label': '已完结', 'value': '1'},
                {'label': '未完结', 'value': '2'}
            ],
            orgList: [],
            orgKey: '',
            orgListCheck: [],
            isBill: false,
            taskdays: 90,
            isTable: false,
            selectRecords: [],
            tmpObject: {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '13': 0},
            time: '',
            startTime: '',
            endTime: '',
            isShow: 0,
            dataKey: '',
            vid: '',
            gid: '',
            hasRoot: '',
            pageTotal: 0,
            allTotal: 0,
            GCOver: '',
            volumeKey: '', 
            checker: '', 
            createTime: '',
            createStartTime: '', 
            createEndTime: '',
            isShowSearch: false,
            sortField: '', 
            sortType: 'auto',
            openStatistics: 0,
        };
    },
    created:function(){
        this.h = window.innerHeight - 50 - 50 - 100 - 48;
        this.stage = ADS.getQueryVariable('i') || '';
        this.hasRoot = ADS.getQueryVariable('hasRoot') || '1';
        this.genealogyName = ADS.getQueryVariable('genealogyName') ? decodeURIComponent(ADS.getQueryVariable('genealogyName')) : '';
        this.gcKey = ADS.getQueryVariable('gcKey') || '';
        this.place = ADS.getQueryVariable('place') ? encodeURIComponent(ADS.getQueryVariable('place')) : '';
        this.singleOrTwo = ADS.getQueryVariable('singleOrTwo') || '';
        this.isLeadImages = ADS.getQueryVariable('isLeadImages') || '';
        this.startTime = ADS.getQueryVariable('startTime') || '';
        this.endTime = ADS.getQueryVariable('endTime') || '';
        this.orgListCheck = ADS.getQueryVariable('orgListCheck') ? ADS.getQueryVariable('orgListCheck').split(',') : [];
        this.page = ADS.getQueryVariable('page') ? Number(ADS.getQueryVariable('page')) : 1;

        if(this.startTime && this.endTime){
            this.time = [Number(this.startTime), Number(this.endTime)];
        }else{
            this.startTime = '';
            this.endTime = '';
            this.time = '';
        }

        if(this.stage){
            
        }else{
            if(this.role >= 1 && this.role <= 3){
                if(this.role == 3){
                    this.stage = 3;
                }else{
                    this.stage = 14;
                }
            }else{
                if(this.orgAdmin == 'admin'){
                    this.stage = 13;
                }else{
                    this.stage = 1;
                }
            }
        }
    },
    mounted:function(){
        this.$router.push('/'+this.pathname+'/takeCamera?i='+this.stage+'&hasRoot='+this.hasRoot+'&genealogyName='+this.genealogyName+'&gcKey='+this.gcKey+'&place='+this.place+'&singleOrTwo='+this.singleOrTwo+'&isLeadImages='+this.isLeadImages+'&startTime='+this.startTime+'&endTime='+this.endTime+'&orgListCheck='+this.orgListCheck.join(',')+'&page='+this.page);
        this.getOrgList();
        this.getTaskList();
        this.getStatisticsData();
    },
    methods:{
        handleLog({ row }){
            this.isShow = 3;
            this.vid = row.volumeKey;
        },
        sortChangeEvent({column, property, order, sortBy, sortList, $event}){
            console.log(property, order, sortBy);
            this.sortField = sortBy;
            this.sortType = order;
            this.getTaskList();
        },
        rowClassName({ row, rowIndex }){
            if(row.GCOver == '1'){
                return 'row-blue';
            }
            if(row.isLook){
                return 'row-gray';
            }
            if(row.sourceStatus == 6){
                return 'row-purple';
            }
        },
        getTaskListAll(){
            this.sortField = '';
            this.sortType = '';
            this.page = 1;
            this.$router.push('/'+this.pathname+'/takeCamera?i='+this.stage+'&hasRoot='+this.hasRoot+'&genealogyName='+this.genealogyName+'&gcKey='+this.gcKey+'&place='+this.place+'&singleOrTwo='+this.singleOrTwo+'&isLeadImages='+this.isLeadImages+'&startTime='+this.startTime+'&endTime='+this.endTime+'&orgListCheck='+this.orgListCheck.join(',')+'&page='+this.page);
            this.getTaskList();
            this.getStatisticsData();
        },
        handleUpdateVolumeProperty(){
            if(!this.selectRecords.length){
                return this.$XModal.message({message: '请勾选相应的卷册', status: 'warning'});
            }
            this.isShow = 2;
        },
        saveData(){
            this.isShow = 0;
            this.getTaskList();
            this.getStatisticsData();
        },
        patchTaskVerify(){
            if(!this.selectRecords.length){
                return this.$XModal.message({message: '请勾选相应的卷册', status: 'warning'});
            }
            this.$confirm('是否确认批量审核通过?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.patchReviewTaskVerify('pass');
            }).catch(() => {});
        },
        async patchReviewTaskVerify(operate, returnReason = ''){// 批量卷册打回、提交审阅
            let result = await api.patchAxios('v3/review/task/verifyBatch', {'volumeKeyArr': this.selectRecords, 'operate': operate, 'returnReason': returnReason, 'siteKey': this.stationKey, 'userKey': this.userId});
            if(result.status == 200){
                let msg = '';
                result.data.forEach((ele) => {
                    msg = msg + ele.genealogyName+' 的 '+ele.volumeNumber+' 机构审核通过失败，原因：'+ele.errorInfo+';';
                });
                this.selectRecords = [];
                if(msg){
                    this.$alert(msg, '批量提交审核', {
                        confirmButtonText: '确定',
                        callback: action => {
                            this.getTaskList();
                            this.getStatisticsData();
                        }
                    });
                }else{
                    this.getTaskList();
                    this.getStatisticsData();
                }
            }else{
                this.$XModal.message({message: result.msg, status: 'warning'})
            }
        },
        async getCatalogStatisticsData({row}){
            console.log(row);
            this.dataKey = row._key;
            this.vid = row.volumeKey;
            this.isShow = 1;
        },
        selectAllEvent ({ checked, records }) {
            this.selectRecords = records.map((ele) => {
                return ele.volumeKey;
            });
        },
        selectChangeEvent ({ checked, records }) {
            this.selectRecords = records.map((ele) => {
                return ele.volumeKey;
            });
        },
        changeStage(i){
            this.sortField = '';
            this.sortType = '';
            this.singleOrTwo = '';
            this.isLeadImages = '';
            this.page = 1;
            this.stage = i;
            this.selectRecords = [];
            this.$router.push('/'+this.pathname+'/takeCamera?i='+this.stage+'&hasRoot='+this.hasRoot+'&genealogyName='+this.genealogyName+'&gcKey='+this.gcKey+'&place='+this.place+'&singleOrTwo='+this.singleOrTwo+'&isLeadImages='+this.isLeadImages+'&startTime='+this.startTime+'&endTime='+this.endTime+'&orgListCheck='+this.orgListCheck.join(',')+'&page='+this.page);
            this.getTaskList();
            this.getStatisticsData();

        },
        async getStatisticsData(){
            let result = await api.getAxios('v3/review/task/statisticsData?siteKey='+this.stationKey+'&userKey='+this.userId+'&claimOrgKey='+this.orgListCheck);
            if(result.status == 200){
                this.tmpObject = result.data;
                // this.tmpObject[this.stage] = this.total;
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        async getOrgList(){// 机构列表
            let data = await api.getAxios('org?siteKey='+this.stationKey+'&name=');
            if(data.status == 200){
                this.orgList = data.data.map((ele, index)=>{
                    return {'label': ele.organizationNo+'('+ele.name+')', 'value': ele._key};
                });
                this.orgList.unshift({'label': '全部机构序号', 'value': ''});
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async imagePagesTotal(){
            let result = await api.getAxios('v3/review/task/imagePagesTotal?siteKey='+this.stationKey+'&orgListCheck='+this.orgListCheck.join()+'&startTime='+this.startTime+'&endTime='+(this.endTime ? this.endTime+24*60*60*1000 : this.endTime)+'&volumeKey='+this.volumeKey+'&checker='+this.checker+'&createStartTime='+this.createStartTime+'&createEndTime='+(this.createEndTime ? this.createEndTime+24*60*60*1000 : this.createEndTime)+'&userKey='+this.userId+'&stage='+this.stage+'&genealogyName='+this.genealogyName+'&gcKey='+this.gcKey+'&place='+this.place+'&singleOrTwo='+this.singleOrTwo+'&isLeadImages='+this.isLeadImages+'&GCOver='+this.GCOver+'&page='+this.page+'&limit='+this.limit);
            if(result.status == 200){
                this.allTotal = result.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async getTaskList(f = true){// 谱目列表
            this.sortField ? null : this.isTable = false;
            this.loading = true;
            this.tableData = [];
            let searchField = [];
            this.searchFieldList.forEach((ele) => {
                if(ele.value){
                    searchField.push(ele.value);
                }
            });

            let data = await api.getAxios('v3/review/task/listNew?siteKey='+this.stationKey+'&sortField='+this.sortField+'&sortType='+this.sortType+'&orgListCheck='+this.orgListCheck.join()+'&startTime='+this.startTime+'&endTime='+(this.endTime ? this.endTime+24*60*60*1000 : this.endTime)+'&volumeKey='+this.volumeKey+'&checker='+this.checker+'&createStartTime='+this.createStartTime+'&createEndTime='+(this.createEndTime ? this.createEndTime+24*60*60*1000 : this.createEndTime)+'&userKey='+this.userId+'&stage='+this.stage+'&genealogyName='+(this.genealogyName).trim()+'&gcKey='+(this.gcKey).trim()+'&place='+(this.place).trim()+'&singleOrTwo='+this.singleOrTwo+'&isLeadImages='+this.isLeadImages+'&GCOver='+this.GCOver+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status == 200){
                let pageTotal = 0;
                this.tableData = data.result.list.map((ele, index) => {
                    pageTotal = pageTotal +(ele.syncPages || 0);
                    ele.toVoidTimeO = ele.toVoidTime ? ADS.getLocalTime(ele.toVoidTime) : '';
                    ele.beginTimeO = ele.beginTime ? ADS.getLocalTime(ele.beginTime) : '';
                    ele.createTimeO = ele.createTime ? ADS.getLocalTime(ele.createTime) : '';
                    ele.checkDoneTimeL = ele.checkDoneTime ? ADS.getLocalTime(ele.checkDoneTime) : '';
                    ele.checkDoneTimeO = ele.checkDoneTime ? (this.taskdays - ADS.getSurplusDays(ele.checkDoneTime)) : '';
                    ele.taskTime = ele.passTime ? ((ele.passTime - ele.claimTime)/1000/60/60/24).toFixed(2) : '';
                    ele.stageO = this.stageO[ele.volumeTakeStatus];
                    ele.orgO = ele.orgName || ele.creatorName;
                    ele.claimTimeO = ele.claimTime ? ADS.getLocalTime(ele.claimTime) : '';
                    ele.clientUser = ele.deviceInfo ? ele.deviceInfo.device+'('+(ele.deviceInfo.userName || '')+')' : '';
                    ele.submitTimeO = ele.submitTime ? ADS.getLocalTime(ele.submitTime) : '';
                    ele.passTimeOrgAdminO = ele.passTimeOrgAdmin ? ADS.getLocalTime(ele.passTimeOrgAdmin) : '';
                    ele.passTimeL = ele.passTime ? ADS.getLocalTime(ele.passTime) : '';
                    ele.returnTimeO = ele.returnTime ? ADS.getLocalTime(ele.returnTime) : '';
                    ele.payTimeO = ele.payTime ? ADS.getLocalTime(ele.payTime) : '';
                    ele.price = ele.totalPages ? (ele.totalPages*0.18).toFixed(2) : '';
                    ele.bill = ele.volumeTakeStatus >= 8 ? '是' : '';
                    ele.pay = ele.volumeTakeStatus >= 9 ? '是' : '';
                    ele.isLeadImagesO = ele.isLeadImages == 1 ? '是' : ele.isLeadImages == 0 ? '否' : '';
                    ele.singleOrTwoO = ele.singleOrTwo == 1 ? '单页' : ele.singleOrTwo == 2 ? '双页' : '';
                    ele.organizationNo = ele.organizationNo+'('+ele.orgName+')';
                    return ele;
                });
        
                this.pageTotal = pageTotal;
                this.total = data.result.total;
                this.isTable = true;

                f && this.stage >= 3 ? this.imagePagesTotal() : null;
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
        async setPublicTask(catalogKey){// 谱目列表
            let data = await api.postAxios('review/task/setPublicTask', {'catalogKey': catalogKey, 'userKey': this.userId});
            if(data.status == 200){
                this.getTaskList();
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
        setCommonEvent({row}){
            this.$confirm('是否把该家谱设为公共任务?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.setPublicTask(row._key);
            }).catch(() => {});
        },
        lookEvent({row}){
            this.tableData = this.tableData.map((ele) => {
                if(ele.volumeKey == row.volumeKey){
                    ele.isLook = true;
                }
                return ele;
            });
            // this.$router.push('/'+this.pathname+'/cameraImage?vid='+row.volumeKey);, '_blank'
            window.open('/'+this.pathname+'/cameraImage?device='+row.deviceInfo.device+'&vid='+row.volumeKey+'&gid='+row._key+'&genealogyName='+row.genealogyName);
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
            this.$router.push('/'+this.pathname+'/takeCamera?i='+this.stage+'&hasRoot='+this.hasRoot+'&genealogyName='+this.genealogyName+'&gcKey='+this.gcKey+'&place='+this.place+'&singleOrTwo='+this.singleOrTwo+'&isLeadImages='+this.isLeadImages+'&startTime='+this.startTime+'&endTime='+this.endTime+'&orgListCheck='+this.orgListCheck.join(',')+'&page='+this.page);
            this.getTaskList(false);
        },
        navTo({row}){
            if(!row.dataNum){
                this.$XModal.message({message: '暂无关联家谱,无法查看', status: 'warning'});
                return false;
            }
            window.open('/'+this.pathname+'/dor/detail?dorKey='+row._key+'&name='+row.name, '_blank');
            // this.$router.push('/'+this.pathname+'/dor/detail?dorKey='+row._key+'&name='+row.name);
        },
    },
    computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            orgAdmin: state => state.nav.orgAdmin,
            pathname: state => state.nav.pathname,
            orgId: state => state.nav.orgId,
        })
    },
    watch:{
        'selectRecords': (nv, ov) => {
            
        },
        'time': function(nv, ov){
            console.log(nv);
            if(nv){
                this.startTime = new Date(nv[0]).getTime();
                this.endTime = new Date(nv[1]).getTime();
            }else{
                this.startTime = '';
                this.endTime = '';
            }
        },
        'createTime': function(nv, ov){
            console.log(nv);
            if(nv){
                this.createStartTime = new Date(nv[0]).getTime();
                this.createEndTime = new Date(nv[1]).getTime();
            }else{
                this.createStartTime = '';
                this.createEndTime = '';
            }
        },
        'isShowSearch': function(nv, ov){
            this.h = window.innerHeight - 50 - 50 - 100 - 48 - (nv ? 50 : 0);
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
        height: 100%;
        background: #EFF1F5;
        .nav-wrap{
            position: relative;
            width: calc(100% - 40px);
            padding: 0 20px;
            height: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .title{
                font-weight: bold;
            }
            .head-right{
                position: relative;
                display: flex;
                align-items: center;
            }
        }
        .search-wrap{
            position: relative;
            width: calc(100% - 40px);
            height: 50px;
            padding: 0 20px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
        }
        .step-wrap{
            position: relative;
            width: calc(100% - 40px);
            padding: 10px 20px;
            display: flex;
            justify-content: space-around;
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
                img{
                    height: 50px;
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
            height: calc(100% - 200px);
            &.active{
                height: calc(100% - 250px);
            }
        }
    }
}
.page-foot{
    position: relative;
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .page-foot-left{
        display: flex;
        align-items: center;
        p{
            margin-right: 30px;
        }
    }
}
.width100{
    width: 120px;
}
.marginR10{
    margin-right: 10px;
}
.marginL10{
    margin-left: 10px;
}
</style>

