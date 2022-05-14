<template>  
    <div class="wrap">
        <div class="content">
            <ul class="nav-wrap">
                <li>
                    <h3>谱目审核列表</h3>
                </li>
                <li>
                    <!-- <vxe-button content="一键可拍" v-if="active == 4" @click="setCanTakeBatch"></vxe-button> -->
                    <vxe-button content="打回" v-if="active == 4" @click="dataVertify('return')"></vxe-button>
                    <vxe-button content="通过" v-if="active == 4" @click="dataVertify('past')"></vxe-button>
                    <!-- <vxe-button content="返回" @click="goBack"></vxe-button> -->
                </li>
            </ul>
            <div class="table-wrap">
                <vxe-table
                    border
                    class="adai-table"
                    resizable
                    keep-source
                    show-overflow
                    highlight-current-row
                    ref="xTable"
                    :height="h*0.6"
                    :align="'center'"
                    :data="tableData"
                    :row-class-name="rowClassName"
                    @cell-click="cellClickEvent">
                    <vxe-table-column title="可拍信息" fixed="left" width="620">
                        <vxe-table-column field="_key" width="100" title="统一编码" fixed="left"></vxe-table-column>
                        <vxe-table-column field="repeatCount" width="100" title="重复可疑" fixed="left"></vxe-table-column>
                        <vxe-table-column fixed="left" v-if="role >= 1 && role <= 3 && active == 4" field="canTake" title="可拍摄" width="160" :cell-render="{name:'AdaiTabButton', events:{'click':changeCanTake}}"></vxe-table-column>
                        <vxe-table-column fixed="left" v-if="role >= 1 && role <= 3 && active == 4" field="needFill" title="补充字段" width="80" :cell-render="{name:'AdaiSwitchButton',attr:{property:'needFill'},events:{'click':changeStatus}}"></vxe-table-column>
                        <vxe-table-column fixed="left" v-if="role >= 1 && role <= 3 && active == 4" field="needImage" title="补充影像" width="80" :cell-render="{name:'AdaiSwitchButton',attr:{property:'needImage'},events:{'click':changeStatus}}"></vxe-table-column>
                    </vxe-table-column>
                    <vxe-table-column width="100" field="genealogyName" title="谱名" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column width="100" field="publish" title="出版年" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column width="160" field="place" title="谱籍地" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column width="100" field="surname" title="姓氏" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column width="100" field="authors" title="作者" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column width="100" field="volume" title="卷数" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column width="100" field="hall" title="堂号" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column width="100" field="lostVolume" title="缺卷" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column width="100" field="hasVolume" title="实拍册数" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                     <vxe-table-column width="100" field="hasImage" title="影像" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="toggle" title="折叠信息"></vxe-table-column>
                    <vxe-table-column v-for="(item,index) in pumuTheads" :key="'column'+index" :visible="collapsable" width="100" :field="item.fieldName" :title="item.fieldMeans"></vxe-table-column>
                    
                    <!-- <vxe-table-column v-if="active >= 3 && !needReview" field="willIns" :visible="collapsable" title="计划入库" width="80"></vxe-table-column> -->
                    <vxe-table-column v-if="active == 3 && !needReview" field="suggIn" :visible="collapsable" width="100" title="系统建议入库"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3 && !needReview" field="bIdExist" :visible="collapsable" width="100" title="编码重复"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3 && !needReview" field="seemISGN" :visible="collapsable" width="100" title="疑似ISGN"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3 && !needReview" field="repeatRisk" :visible="collapsable" width="100" title="规则认定综合风险"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3 && !needReview" field="lackFieldsNum" :visible="collapsable" width="100" title="残缺字段数"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3 && !needReview" field="lackFields" :visible="collapsable" width="100" title="残缺字段"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3 && !needReview" field="repeatInBatchArr" :visible="collapsable" width="100" title="同批次重复记录"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3 && !needReview" field="repeatInISGNArr" :visible="collapsable"  width="100" title="ISGN重复记录"></vxe-table-column>
                    <vxe-table-column v-if="active <= 3 && !needReview" field="repeatInISGNCount" :visible="collapsable" width="100" title="SGN重复数"></vxe-table-column>
                    <vxe-table-column v-if="active == 3 && needReview" field="addInformation" title="不可拍备注" width="140"></vxe-table-column>
                    <!-- <vxe-table-column v-if="active >= 3" field="hasIn" width="100" title="可拍摄"></vxe-table-column> -->
                    <vxe-table-column v-if="active >= 3" field="annex" title="待提交原因" width="75" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'附件','value':'annex'}]},events:{'annex':annex}}"></vxe-table-column>
                </vxe-table>
            </div>
            <RepeatJiapuModal v-if="active >= 2" :row="row" :h="h" :pumuThead="pumuThead" :isF="true" />
        </div>
        <AnnexModal v-if="isShowAnnex" :gid="gid" :createUser="createUser" :row="annexRow" v-on:close-annex="isShowAnnex = false" :active="active" />
        <div class="needFill-box" v-if="isNeedFill">
            <h3>补充字段</h3>
            <img class="needFill-close" src="../../assets/close.svg" @click="isNeedFill = false" alt="">
            <vxe-select v-model="needFillList" placeholder="补充字段" multiple>
                <vxe-option v-for="(item,index) in pumuThead" :key="index" :value="item.fieldMeans" :label="item.fieldMeans"></vxe-option>
            </vxe-select>
            <vxe-button content="保存" @click="saveNeedFill"></vxe-button>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import AnnexModal from "../../components/QingTimeGenealogy/AnnexModal.vue";
import RepeatJiapuModal from "../../components/batchManage/RepeatJiapuModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "bookAuditList",
    components: {
        AnnexModal,RepeatJiapuModal,
    },
    data: () => {
        return {
            tableData: [],
            batchId: '',
            filter: true,
            active: 0,
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
            needReview: '',
            pumuThead: [],
            pumuTheads: [],
            isShow: false,
            isManage: false,
            repeatNum: 0,
            collapsable: false,
            needFillList: [],
            isNeedFill: false,
            dataStatus: '',
        };
    },
    created:function(){
        let search = window.location.search,param=ADS.params(search);
        this.batchId = param['batchID'] || '';
        this.active = param['state'] ? Number(param['state']) : 0;
        this.h = window.innerHeight - 110;
    },
    mounted:function(){
        this.getPumuTable();
        this.getDataCheckLog();
    },
    methods:{
        saveNeedFill(){
            console.log(this.needFillList);
            if(this.needFillList && this.needFillList.length){
                this.isNeedFill = false;
                this.changeDataStatus(this.dataStatus,this.needFillList);
            }else{
                this.$XModal.message({ message: '请选择补充字段', status: 'warning' });
            }
        },
        setCanTakeBatch:async function(){
            this.changeLoading();
            let data=await api.patchAxios('setCanTakeBatch',{'batchKey':this.batchId});
            this.changeLoading(false);
            if(data.status == 200){
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        goBack(){
            history.go(-1);
        },
        suggInBatch:async function(){// 批次计划入库
            this.changeLoading();
            let data=await api.patchAxios('data/willIn/batch',{'batchKey':this.batchId});
            this.changeLoading(false);
            if(data.status == 200){
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
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
        changeLoading(flag = true){
            this.$store.dispatch('setPropertyValue',{'property':'loading','value': flag});
        },
        dataVertify:async function(operate){// 补充资料/审核通过
            let isF = false;
            if(operate == 'past'){
                this.tableData.forEach((ele) => {
                    if(ele.canTake == 1){
                        isF = true;
                    }
                });
                if(!isF){
                    ADS.message('请选择可拍，在通过');
                    return;
                }
            }
            this.changeLoading();
            let data = await api.postAxios('data/vertify',{'batchKey':this.batchId,'operate':operate, 'userKey': this.userId});
            this.changeLoading(false);
            if(data.status == 200){
                if(operate == 'return'){
                    this.$XModal.message({ message: '打回成功', status: 'success' });
                    let timer = setTimeout(() => {
                        clearTimeout(timer);
                        timer = null;
                        this.$router.push({'path': ('/'+window.localStorage.getItem('pathname')+'/bookaudit')});
                    }, 200);
                }else{
                    this.getDataCheckLog();
                }
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
            this.dataStatus = data;
            if(data.property === 'needFill' && !data.row.needFill && data.row.canTake == 3){
                this.isNeedFill = true;
            }else{
                this.changeDataStatus(data);
            }
        },
        changeDataStatus:async function(data, needFillFields = ''){//改变状态
            if(data.row.hasIn == '否'){
                if(data.row.canTake != 3){
                    return false;
                }
                this.changeLoading();
                let result = await api.patchAxios('data/status',{'dataKey':data.row._key,[data.property]:data.row[data.property] ? '' : 1,'needFillFields': needFillFields});
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
        collapsableEvent () {
            this.collapsable = !this.collapsable;
            const xTable = this.$refs.xTable;
            xTable.refreshColumn();
        },
        cellClickEvent({row,column}){
            if(column.property == 'toggle'){
                this.collapsableEvent();
                return false;
            }
            if(column.property == 'willIn' || column.property == 'annex' || column.property == 'delete' || column.property == 'needFill' || column.property == 'needImage'){
                this.row = {};
            }else{
                this.row = row;
            }
        },
        rowClassName ({ row, rowIndex }) {
            if(row.suggIn == '否') {
                return 'row-red'
            }
        },
        getDataCheckLog:async function(){// 批次列表谱目
            let data=await api.getAxios('data/checkLog/new?batchKey='+this.batchId+'&userRole='+this.role+'&userKey='+this.userId+'&willIn='+this.caozheng+'&needFill='+(this.examine == 'needFill' ? 1 : '')+'&canTake='+(this.examine == 'needFill' || this.examine == 'needImage' ? '' : this.examine)+'&needImage='+(this.examine == 'needImage' ? 1 : ''));
            if(data.status == 200){
                let batch = data.batch,state = 0,repeatNum = 0;
                batch.hasClean ? state = 1 : null;
                batch.hasCheckInBatch ? state = 2 : null;
                batch.hasCheckInISGN ? state = 3 : null;
                batch.needReview ? state = 3 : null;
                batch.hasSubmit ? state = 4 : null;
                batch.hasPast ? state = 5 : null;
                this.active = state;
                this.needReview = batch.needReview;
                this.createUser = batch.createUser;
                data.data.map((item)=>{
                    item.toggle = '>';
                    item.addInformation = (item.needFill ? '补充字段 ' : '')+(item.needImage ? '临时影像' : '');
                    item.suggIn = item.suggIn ? '是' : '否';
                    item.hasIn = item.hasIn ? '是' : '否';
                    item.location = item.location && item.location.length && item.location.join(',');
                    item.address = (item.prov || '') + ' ' + (item.city || '') + ' ' + (item.district || '');
                    item.willIns = item.willIn == 1 ? '是' : '否';
                    if(item.suggIn == '否'){
                        repeatNum = repeatNum + 1;
                    }
                });
                this.repeatNum = repeatNum;
                console.log(this.repeatNum);
                this.tableData = data.data;
                this.total = data.total;
                this.$refs.xTable.refreshColumn();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getPumuTable:async function(){// 谱目全部表头
            let data=await api.getAxios('field?type=家谱');
            if(data.status == 200){
                let pumuTheads = [];
                // this.pumuThead = data.data;
                data.data.map((item)=>{
                    if(['hasVolume','hasImage','genealogyName','publish','place','surname','authors','volume','hall','publishAD','address','authorFst','LocalityModern','lostVolume'].indexOf(item.fieldName) > -1){
                        // console.log(item.fieldMeans);
                    }else{
                        pumuTheads.push(item);
                    }
                });
                this.pumuTheads = pumuTheads;
                this.pumuThead = data.data;
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
        .nav-wrap{
            padding: 0 20px;
            width: calc(100% - 40px);
            display: flex;
            height: 60px;
            line-height: 60px;
            justify-content: space-between;
            align-items: center;
        }
        .table-wrap{
            width: 100%;
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
.needFill-box{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    padding: 20px;
    border-radius: 5px;
    z-index: 1000;
    box-shadow: 0 0 2px 3px #ddd;
    .needFill-close{
        position: absolute;
        top: 20px;
        right: 20px;
        cursor: pointer;
        width: 20px;
        height: 20px;
    }
}
</style>

