<template>  
    <div class="wrap">
        <div class="content">
            <BatchNavModal v-on:change-Tobediscussed="changeTobediscussed" v-on:set-unrepeat="setUnRepeatInBatch" :selectRecords="selectRecords" v-on:change-value="changeValue" v-on:data-vertify="dataVertify" v-on:get-jiapu="getDataCheckLog" v-on:change-is-manage="changeManange" :batchId="batchId" :l="tableData.length" :repeatNum="repeatNum" :active="active" :caozhengs="caozhengs" :examines="examines" :needReview="needReview" :isPiL="active == 3 && !needReview && userId == createUser" />
            <p class="condition">谱状态说明:f,审核通过且已拍摄;nf,审核通过未拍摄;r,无效谱;d,谱书重复;m,待议谱。</p>
            <AdaiStepModal :list="stage" :step="active" v-on:next-step="next" />
            
            <div class="table-wrap" v-if="isShowTable">
                <vxe-table
                    border
                    class="adai-table"
                    resizable
                    :keep-source="true"
                    :row-key="true"
                    :auto-resize="true"
                    show-overflow
                    highlight-current-row
                    ref="xTable3"
                    :height="h*0.6"
                    :align="'center'"
                    :data="tableData"
                    :keyboard-config="{isArrow: true}"
                    :edit-config="{trigger: 'click', mode: 'row',showStatus: true,activeMethod:activeCellMethod}"
                    @checkbox-all="selectAllEvent"
                    @checkbox-change="selectChangeEvent"
                    @edit-closed="editClosedEvent"
                    :row-class-name="rowClassName"
                    @cell-click="cellClickEvent">
                    <vxe-table-colgroup title="家谱信息" fixed="left">
                        <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                        <vxe-table-column v-for="(item,index) in field_main" :key="'main'+index" width="100" :field="item.fieldName" :title="item.fieldMeans" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                        <vxe-table-column v-if="active == 3" field="addInformation" title="审核意见" width="140"></vxe-table-column>
                    </vxe-table-colgroup>
                    <vxe-table-column v-if="active >= 3 && active <= 4" field="hasIn" title="可拍摄" width="70"></vxe-table-column>
                    <vxe-table-column v-if="active >= 3 && active <= 4" field="annex" title="附件上传" width="160" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'附件','value':'annex'}, {'label':'快捷查询','value':'singleQuick'}]},events:{'annex':annex, 'singleQuick': singleQuick}}"></vxe-table-column>
                    <vxe-table-column v-if="active == 3" width="100" field="suggIn" title="系统建议入库"></vxe-table-column>
                    <vxe-table-column v-if="active == 3" title="待提交" width="100" :cell-render="{name:'RuKuModal',attr:{value:'是'},events:{'click':dataWillInEvent}}"></vxe-table-column>
                    
                    <vxe-table-column v-for="(item,index) in field_branch" :key="'branch'+index" width="100" :field="item.fieldName" :title="item.fieldMeans" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>

                    <vxe-table-column v-if="active <= 3" width="100" field="bIdExist" title="编码重复"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3" width="100" field="seemISGN" title="疑似ISGN"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3" width="100" field="repeatRisk" title="规则认定综合风险"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3" width="100" field="lackFieldsNum" title="残缺字段数"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3" width="100" field="lackFields" title="残缺字段"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3" width="100" field="repeatInBatchArr" title="同批次重复记录"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3" width="100" field="repeatInISGNArr" title="ISGN重复记录"></vxe-table-column>
                </vxe-table>
            </div>
            
            <RepeatJiapuModal v-if="active >= 2" :row="row" :h="h" :active="active" :pumuThead="pumuThead" />
        </div>
        <AdaiSourceModal v-if="active == 2 && isShow" :stationKey="stationKey" v-on:close-source="closeSource" v-on:source-check="clickDataCheck" />
        <AnnexModal v-if="isShowAnnex" :gid="gid" :createUser="createUser" :row="annexRow" v-on:close-annex="isShowAnnex = false" :active="active" />
        <ManageModal v-show="isManage" v-on:close-manage="isManage = false" v-on:set-filter="setFilter" />
        <div class="process-wrap" v-if="Ppage && Ppage < Ptotal">
            <el-button class="reconnect" type="primary" @click="reconnect">重新连接</el-button>
            <el-progress type="circle" :percentage="Number((100*Ppage/Ptotal).toFixed(2))"></el-progress>
        </div>
        <div class="suggest-box" v-if="isSuggest">
            <h3>待提交原因</h3>
            <img class="suggest-close" src="../../assets/close.svg" @click="isSuggest = false" alt="">
            <vxe-input v-model="suggest"></vxe-input>
            <vxe-button content="保存" @click="saveSuggest"></vxe-button>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import AnnexModal from "../../components/QingTimeGenealogy/AnnexModal.vue";
import ManageModal from "../../components/batchManage/ManageModal.vue";
import AdaiStepModal from "../../components/batchManage/AdaiStepModal.vue";
import AdaiSourceModal from "../../components/batchManage/AdaiSourceModal.vue";
import RepeatJiapuModal from "../../components/batchManage/RepeatJiapuModal.vue";
import BatchNavModal from "../../components/batchManage/BatchNavModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "batchdatastage",
    components: {
        AnnexModal,ManageModal,AdaiStepModal,AdaiSourceModal,RepeatJiapuModal,BatchNavModal,
    },
    data: () => {
        return {
            tableData: [],
            batchId: '',
            filter: true,
            stageState: [{'label':'已完成','value':1},{'label':'未完成','value':null}],
            stage: ['数据自动清洗','批次内查重','大库查重','提交审核','审核通过'],
            stageO: {
                0:'数据自动清洗',
                1:'批次内查重',
                2:'大库查重',
                3:'提交审核',
                4:'审核通过',
            },
            active: 0,
            batchTable: [],
            pumuThead: [],
            row: {},
            caozheng:'',
            caozhengs: [],
            total: 0,
            createUser: '',
            h: 1080,
            isShowAnnex: false,
            annexRow: '',
            gid: '',
            examine:'',
            examines: [{'label':'全部','value':''},
            {'label':'可拍机','value': 1},
            {'label':'补充字段','value':'needFill'},
            {'label':'临时影像','value':'needImage'},
            {'label':'无效','value': 2},
            {'label':'重复','value': 0}],
            needReview: 0,
            actionData: [{'label':'确认','value':'link'}],
            pumuTheads: [],
            isShow: false,
            isManage: false,
            repeatNum: 0,
            isTableShow: true,
            selectRecords: [],
            collapsable: false,
            isSuggest: false,
            suggest: '',
            setInRow: '',
            fileName: '',
            field_main: [],
            field_branch: [],
            isShowTable: true,
            Tobediscussed: true,
        };
    },
    created:function(){
        let search = window.location.search,param=ADS.params(search);
        this.batchId = param['batchID'] || '';
        this.active = param['state'] ? Number(param['state']) : 0;
        this.fileName = param['f'] ? decodeURIComponent(param['f']) : '';
        this.h = window.innerHeight - 145 - 5;
        

        this.field_main = [
            {'fieldMeans': '家谱姓氏', 'fieldName': 'surname'},
            {'fieldMeans': '家谱谱名', 'fieldName': 'genealogyName'},
            {'fieldMeans': '出版年', 'fieldName': 'publish'},
            {'fieldMeans': '谱籍_依谱书所载', 'fieldName': 'LocalityModern'},
            {'fieldMeans': '卷数', 'fieldName': 'volume'},
            {'fieldMeans': '堂号', 'fieldName': 'hall'},
            {'fieldMeans': '状态', 'fieldName': 'condition'},
        ];

        this.field_branch = [
            {'fieldMeans': '作者姓名', 'fieldName': 'authors'},
            {'fieldMeans': '实拍册数', 'fieldName': 'hasVolume'},
            {'fieldMeans': '缺卷', 'fieldName': 'lostVolume'},
            {'fieldMeans': '版本类型', 'fieldName': 'version'},
            {'fieldMeans': '作者职务', 'fieldName': 'authorJob'},

            {'fieldMeans': '一世祖', 'fieldName': 'firstAncestor'},
            {'fieldMeans': '始迁祖', 'fieldName': 'migrationAncestor'},
            {'fieldMeans': '备注', 'fieldName': 'memo'},
            {'fieldMeans': '重复谱书编号', 'fieldName': 'Dupbookid'},
            {'fieldMeans': '说明', 'fieldName': 'explain'},
            {'fieldMeans': '档案时间', 'fieldName': 'Filetimes'},
            {'fieldMeans': '档名', 'fieldName': 'Filenames'},
            {'fieldMeans': '代号', 'fieldName': 'code'},
            {'fieldMeans': '谱籍_现代地名', 'fieldName': 'place'},
            {'fieldMeans': '谱书编号', 'fieldName': 'bookId'},
            {'fieldMeans': 'DGS 号码', 'fieldName': 'DGS'},
            {'fieldMeans': '微卷编号', 'fieldName': 'film'},
            {'fieldMeans': '家谱群组ID', 'fieldName': 'genealogyGroupID'},
            {'fieldMeans': '项目ID', 'fieldName': 'Projectid'},
            {'fieldMeans': '拍摄日期', 'fieldName': 'capturedate'},
            {'fieldMeans': 'Media', 'fieldName': 'Media'},
            {'fieldMeans': '重复专案ID', 'fieldName': 'DupProjectID'},
            {'fieldMeans': '认领单位', 'fieldName': 'claim'},
            {'fieldMeans': '认领日期', 'fieldName': 'claimDate'},
            {'fieldMeans': '拍摄期限', 'fieldName': 'shootingPeriod'},
            {'fieldMeans': '前次认领单位1', 'fieldName': 'pervious1'},
            {'fieldMeans': '前次认领日期1', 'fieldName': 'perviousDate1'},
            {'fieldMeans': '前次认领单位2', 'fieldName': 'pervious2'},
            {'fieldMeans': '前次认领日期2', 'fieldName': 'perviousDate2'},
            {'fieldMeans': '前次认领单位3', 'fieldName': 'pervious3'},
            {'fieldMeans': '前次认领日期3', 'fieldName': 'perviousDate3'},
            {'fieldMeans': '序号', 'fieldName': 'VolumeFst'},
            {'fieldMeans': '起年', 'fieldName': 'startYear'},
        ];
    },
    mounted:function(){
        this.getPumuTable();
    },
    methods:{
        singleQuick({ row }){
            console.log(row);
            window.open('/'+this.pathname+'/singleQuickSearch?id='+row._key, '_blank');
        },
        changeTobediscussed(data){
            this.Tobediscussed = data;
            this.active == 3 && this.needReview ? this.getDataCheckLog() : null;
        },
        collapsableEvent () {
            this.collapsable = !this.collapsable;
            const xTable3 = this.$refs.xTable3;
            xTable3.refreshColumn();
        },
        selectAllEvent ({ checked, records }) {
            this.selectRecords = records;
        },
        selectChangeEvent ({ checked, records }) {
            this.selectRecords = records;
        },
        reconnect(){
            console.log('reconnect');
            this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
            this.getCleanStatus();
        },
        getCleanStatus: async function(){// 清洗是否结束
            let data=await api.getAxios('data/clean/status?batchKey='+this.batchId);
            if(data.status == 200){
                this.getDataCheckLog();
                this.$store.dispatch('setPropertyValue',{'property': 'Ptotal', 'value': 1});
                this.$store.dispatch('setPropertyValue',{'property': 'Ppage', 'value': 0});
            }
        },
        changeValue(data){
            this[data.label] = data.value;
        },
        changeManange(){
            this.isManage = true;
        },
        getVertifyOption:async function(){// 可拍机状态检索
            let data=await api.getAxios('data/vertifyOption?batchKey='+this.batchId);
            if(data.status == 200){
                this.examines = data.result;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getWillInOption:async function(){// 计划入库状态检索
            let data=await api.getAxios('data/willInOption?batchKey='+this.batchId);
            if(data.status == 200){
                this.caozhengs = data.result;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        setFilter(data){
            this.filter = data;
            this.isManage = false;
        },
        closeSource(flag){
            this.isShow = flag;
        },
        clickDataCheck(libKey){
            this.dataCheck('inISGN',libKey);
        },
        changeLoading(flag = true){
            this.$store.dispatch('setPropertyValue',{'property':'loading','value': flag});
        },
        dataVertify:async function(operate){// 补充资料/审核通过
            this.batchInBase();
        },
        batchInBase: async function(){// 批量审核通过
            this.changeLoading();
            let data=await api.postAxios('batchInBase',{'batchKey':this.batchId, 'userKey': this.userId});
            this.changeLoading(false);
            if(data.status == 200){
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        annex({row}){
            this.annexRow = row;
            this.gid = row._key;
            this.isShowAnnex = true;
        },
        changeCanTake:async function(data){
            console.log(data);
            if(data.row.hasIn == '否'){
                this.changeLoading();
                let result = await api.patchAxios('data/status',{'dataKey':data.row._key,'canTake':data.status});
                this.changeLoading(false);
                if(result.status == 200){
                    this.tableData.map((item)=>{
                        if(item._key == data.row._key){
                            item.canTake = data.status;
                        }
                    });
                    this.getVertifyOption();
                }else{
                    this.$XModal.message({ message: result.msg, status: 'warning' });
                }
            }else{
                this.$XModal.message({ message: '已入库，不允许修改', status: 'warning' });
            }
        },
        changeStatus:async function(data){//改变状态
            console.log(data);
            if(data.row.hasIn == '否'){
                if(data.row.canTake != 3){
                    return false;
                }
                this.changeLoading();
                let result = await api.patchAxios('data/status',{'dataKey':data.row._key,[data.property]:data.row[data.property] ? '' : 1});
                this.changeLoading(false);
                if(result.status == 200){
                    this.tableData.map((item)=>{
                        if(item._key == data.row._key){
                            item[data.property] = item[data.property] ? '' : 1;
                        }
                    });
                    this.getVertifyOption();
                }else{
                    this.$XModal.message({ message: result.msg, status: 'warning' });
                }
            }else{
                this.$XModal.message({ message: '已入库，不允许修改', status: 'warning' });
            }
        },
        dataWillInEvent(row){
            console.log(row);
            this.setInRow = row;
            if(this.active == 3 && this.needReview){
                if(row.data.toBeRediscussed == 1 && row.data.condition == 'm'){

                }else{
                    return ADS.message('非待议谱，不允许操作！');
                }
            }
            if(row.willIn == 1 && row.suggIn == '否'){
                this.isSuggest = true;
            }else{
                this.dataWillIn(row);
            }
        },
        saveSuggest(){
            if(this.suggest){
                this.isSuggest = false;
                this.dataWillIn(this.setInRow, this.suggest);
                this.suggest = '';
            }else{
                this.$XModal.message({ message: '请填写待提交原因', status: 'warning' });
            }
        },
        next(active){
            if(this.active <= 4){
                switch(active){
                    case 0:
                        this.userId == this.createUser && this.active === 0 ? this.dataClean() : null;
                        break;
                    case 1:
                        this.userId == this.createUser && this.active === 1 ? this.dataCheck('inBatch','') : null;
                        break;
                    case 2:
                        if(this.active === 2){
                            if(this.userId == this.createUser){
                                // this.closeSource(true);
                                // 大库查重 => 所有数据
                                this.dataCheck('inISGN', '');
                            }else{
                                ADS.message('本人上传的谱目才能大库查重');
                            }
                        }else{
                            ADS.message('暂时无法进行此操作');
                        }
                        
                        break;
                    case 3:
                        if(this.active === 3){
                            if(this.userId == this.createUser){
                                let isAll = this.tableData.every((ele) => { return ele.willIn >= 1 && ele.willIn <= 2; });
                                console.log(isAll);
                                if(isAll){
                                    this.dataSubmit();
                                }else{
                                    ADS.message('有谱目未作处理，请手动处理待提交谱目');
                                }
                            }else{
                                ADS.message('本人上传的谱目才能提交审核');
                            }
                        }else{
                            ADS.message('暂时无法进行此操作');
                        }
                        break;
                    case 4:
                        // this.role >= 1 && this.role <= 2 && this.active == 4 ? this.dataVertify('past') : null;
                        break;
                    default:
                        break;
                }
            }
        },
        activeCellMethod({row,column}){//控制编辑
            if(this.active <= 0 || this.active == 2 || this.active == 4 || (this.active == 3 && !this.needReview) || (this.active == 3 && row.canTake != 3)){
                return false;
            }
            if(['willIn','suggIn','hasIn','annex','delete'].indexOf(column.property) > -1){
                return false;
            }
            return true;
        },
        editClosedEvent({row}){
            if(this.active == 1 || this.active == 3 || this.active == 5){
                this.editCatalog(row);
            }
        },
        cellClickEvent({row,column}){
            if(this.active === 3 && column.property == 'toggle'){
                this.collapsableEvent();
                return false;
            }
            if(this.active == 2 || (this.active == 3 && !this.needReview)){
                if(column.property == 'willIn' || column.property == 'annex' || column.property == 'delete' || !column.property){
                    this.row = {};
                }else{
                    this.row = row;
                }
            }else{
                this.row = {};
            }
        },
        rowClassName ({ row, rowIndex }) {
            if(this.active == 5){
                if(row.condition == 'm'){
                    return 'row-red';
                } 
                if(row.condition == 'd' || row.condition == 'r'){
                    return 'row-orange';
                }
            }else{
                if(row.suggIn == '否') {
                    if(row.repeatRisk >= 90){
                        return 'row-red'
                    }else{
                        return 'row-orange'
                    }
                }
            }
        },
        dataClean:async function(){
            this.changeLoading();
            let data=await api.postAxios('data/clean',{batchKey:this.batchId,filter:this.filter ? 1 : '','userKey': this.userId});
            this.changeLoading(false);
            if(data.status == 200){
                // this.active++;
                this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
                this.$XModal.message({ message: data.msg, status: 'success' });
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        dataISGN:async function(){
            this.changeLoading();
            let data=await api.postAxios('ISGN',{'batch':this.batchId,'userKey':this.userId,filter:this.filter ? 1 : ''});
            this.changeLoading(false);
            if(data.status == 200){
                // this.active++;
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        dataSubmit:async function(){// 提交审核
            let isF = false;
            this.tableData.forEach((ele) => {
                if(ele.willIn == 1){
                    isF = true;
                }
            });
            if(!isF){
                ADS.message('请批量计划入库，在提交审核');
                return;
            }
            this.changeLoading();
            let data=await api.postAxios('data/submit',{'batchKey':this.batchId, 'userKey':this.userId, 'siteKey': this.stationKey, 'orgKey': this.orgId});
            this.changeLoading(false);
            if(data.status == 200){
                // this.active++;
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        dataCheck:async function(checkType,libKey){
            this.changeLoading();
            let data=await api.postAxios('data/check',{'batchKey':this.batchId,'checkType':checkType,filter:this.filter ? 1 : '','libKey': libKey, 'userKey': this.userId, 'siteKey': this.stationKey, 'orgKey': this.orgId});
            this.changeLoading(false);
            if(data.status == 200){
                // this.active++;
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        getDataCheckLog:async function(){// 批次列表谱目
            this.isShowTable = false;
            let data=await api.getAxios('data/checkLog/new?batchKey='+this.batchId+'&userKey='+this.userId+'&willIn='+this.caozheng+'&needFill='+(this.examine == 'needFill' ? 1 : '')+'&canTake='+(this.examine == 'needFill' || this.examine == 'needImage' ? '' : this.examine)+'&needImage='+(this.examine == 'needImage' ? 1 : ''));
            this.isShowTable = true;
            if(data.status == 200){
                let tableData = [];
                this.$store.dispatch('setPropertyValue',{'property': 'cleanOk', 'value': false});
                let batch = data.batch,state = 0,repeatNum = 0;
                batch.hasClean ? state = 1 : null;
                batch.hasCheckInBatch ? state = 2 : null;
                batch.hasCheckInISGN ? state = 3 : null;
                batch.needReview ? state = 3 : null;
                batch.hasSubmit ? state = 4 : null;
                batch.hasPast ? state = 5 : null;
                this.active = state;
                this.needReview = batch.needReview || 0;
                this.createUser = batch.createUser;
                data.data.map((item)=>{
                    item.Filetimes = ADS.getLocalTime(item.Filetimes, '/', 1) || item.Filetimes;
                    item.fileName = this.fileName;
                    item.toggle = '>';
                    item.addInformation = (item.needFill ? '补充字段 ' : '')+(item.needImage ? '补充影像' : '');
                    item.suggIn = item.suggIn ? '是' : '否';
                    item.hasIn = item.hasIn ? '是' : '否';
                    item.location = item.location && item.location.length && item.location.join(',');
                    item.address = (item.prov || '') + ' ' + (item.city || '') + ' ' + (item.district || '');
                    item.willIns = item.willIn == 1 ? '是' : '否';
                    if(item.suggIn == '否'){
                        repeatNum = repeatNum + 1;
                    }
                    if(this.active == 3 && batch.needReview){
                        if(item.toBeRediscussed == 1 && item.condition == 'm'){
                            tableData.push(item);
                        }
                    }
                });
                this.repeatNum = repeatNum;
                // console.log(this.repeatNum);
                this.tableData = this.active == 3 && batch.needReview && this.Tobediscussed ? tableData.length ? tableData : data.data : data.data;
                this.total = data.total;
                // this.$refs['xTable'+ this.active].refreshColumn();
                if(state === 3){
                    setTimeout(() => {
                        const xTable3 = this.$refs.xTable3;
                        xTable3.refreshColumn();
                    },200);
                }
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getPumuTable:async function(){// 谱目全部表头
            let data=await api.getAxios('field?type=家谱');
            if(data.status == 200){
                let pumuTheads = [];
                data.data.map((item)=>{
                    if(['missVolumeSupplement', 'genealogyName','publish','place','surname','authors','volume','hall','publishAD','address','authorFst','LocalityModern','lostVolume', 'hasVolume'].indexOf(item.fieldName) > -1){
                        // console.log(item.fieldMeans);
                    }else{
                        pumuTheads.push(item);
                    }
                });
                this.pumuTheads = pumuTheads;
                // console.log(this.pumuTheads);
                this.pumuThead = data.data;
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        dataWillIn:async function(row, setInReason = ''){// 建议入库
            this.changeLoading();
            let data = await api.patchAxios('data/willIn',{'dataKey':row._key,'willIn':row.willIn, 'setInReason': setInReason, 'userKey': this.userId, 'siteKey': this.stationKey, 'orgKey': this.orgId});
            this.changeLoading(false);
            if(data.status == 200){
                this.tableData.map((item,key)=>{
                    if(item._key === row._key){
                        item.willIn = data.data;
                        item.willIns = data.data == 1 ? '是' : '否';
                    }
                });
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        editCatalog:async function(row){// 编辑谱目
            let dataObj = {};
            // this.pumuThead.map((item)=>{
            //     dataObj[item.fieldName] = row[item.fieldName];
            // });
            this.field_main.map((item)=>{
                if(item.fieldName == 'condition'){
                    if(this.role >= 1 && this.role <= 3){
                        dataObj[item.fieldName] = row[item.fieldName];
                    }else{
                        
                    }
                }else{
                    dataObj[item.fieldName] = row[item.fieldName];
                }
                // dataObj[item.fieldName] = row[item.fieldName];
            });
            this.field_branch.map((item)=>{
                dataObj[item.fieldName] = row[item.fieldName];
            });
            this.changeLoading();
            let data=await api.patchAxios('data/edit',{'dataKey':row._key,'dataObj':dataObj,'userKey': this.userId, siteKey: this.stationKey});
            this.changeLoading(false);
            if(data.status == 200){
                this.active == 1 || this.active == 5 ? this.dataCleanSingle(row._key) : null;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        dataCleanSingle:async function(dataKey){// 单条数据清洗
            this.changeLoading();
            let data=await api.postAxios('data/clean/single',{'dataKey':dataKey});
            this.changeLoading(false);
            if(data.status == 200){
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        deleteCatalog({row}){
            this.$confirm('此操作将永久删除该谱目数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteCatalogApi(row);
            }).catch(() => {});
        },
        setUnRepeatInBatch(arr){
            if(arr && arr.length){
                this.tableData.map((item,index) => {
                    if(arr.indexOf(item._key) > -1){
                        item.suggIn = '是'
                    }
                });
            }
        },
        deleteCatalogApi:async function(row){
            let i = -1;
            this.changeLoading();
            let data = await api.deleteAxios('cleanRepeatInBatch',{dataKey: row._key});
            this.changeLoading(false);
            if(data.status == 200){
                this.tableData.map((item,index) => {
                    if(item._key == data.data){
                        item.suggIn = '是'
                    }
                    if(item._key == row._key){
                        i = index;
                    }
                });
                this.tableData.splice(i,1);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        }
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            orgId: state => state.nav.orgId,
            role: state => state.nav.role,
            Ptotal: state => state.nav.Ptotal,
            Ppage: state => state.nav.Ppage,
            cleanOk: state => state.nav.cleanOk,
            pathname: state => state.nav.pathname,
        })
    },
    watch:{
        'active': function(nv,ov){
            if(nv == 3){
                this.getWillInOption();
            }
            if(nv >= 3){
                this.getVertifyOption();
            }
        },
        'cleanOk': function(nv,ov){
            if(nv){
                this.getDataCheckLog();
                this.$store.dispatch('setPropertyValue',{'property': 'Ptotal', 'value': 1});
                this.$store.dispatch('setPropertyValue',{'property': 'Ppage', 'value': 0});
            }
        },
    },
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    width: 100%;
    height: 100%;
    text-align: left;
    .content{
        position: relative;
        width: 100%;
        height: 100%;
        background: #EFF1F5;
        .table-wrap{
            // position: relative;
            // position: absolute;
            // top: 100px;
            // left: 0;
            // height: calc(60% - 90px);
            // overflow-x: auto;
            width: 100%;
            // .table-box{
            //     width: 3000px;
            // }
        }
        .place-wrap{
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 500px;
            z-index: 10000;
            background-color: #fff;
        }
    }
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
.suggest-box{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    border-radius: 5px;
    padding: 20px;
    z-index: 1000;
    box-shadow: 0 2px 3px #ddd;
    .suggest-close{
        position: absolute;
        top: 20px;
        right: 20px;
        cursor: pointer;
        width: 20px;
        height: 20px;
    }
}
</style>

