<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <div class="nav-wrap">
                <div class="nav-left">
                    <h3 class="title">开放谱书列表(总共{{total}}条数据)</h3>
                </div>
                <div class="nav-left">
                    <el-button v-if="role <= 3  && role >= 1 && openStatus == 'opened'" type="primary" size="small" @click="handleClaimSome">批量设置认领机构</el-button>
                    <el-button v-if="role <= 3  && role >= 1 && openStatus == 'waitOpen'" type="primary" size="small" @click="handleOpenSome">批量开放谱书</el-button>
                </div>
            </div>
            <div class="search-wrap">
                <el-input class="width150 marginR10" placeholder="请输入谱ID" v-model="gcKey" clearable size="small"></el-input>
                <el-input class="width150 marginR10" placeholder="请输入谱名" v-model="genealogyName" clearable size="small"></el-input>
                <el-input class="width150 marginR10" placeholder="请输入文件名" v-model="fileName" clearable size="small"></el-input>
                <el-input class="width150 marginR10" placeholder="请输入档名" v-model="Filenames" clearable size="small"></el-input>
                <el-date-picker
                    class="width250 marginR10"
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    size="small"
                    :start-placeholder="'认领开始时间'"
                    :end-placeholder="'认领结束时间'"
                />
                <el-select class="width150 marginR10" v-model="openStatus" size="small" placeholder="开放状态">
                    <el-option
                        v-for="item in openStatusList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select v-if="role <=3  && role >=1" class="width150 marginR10" v-model="orgKey" placeholder="上传机构" size="small">
                    <el-option
                        v-for="item in orgList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-button type="primary" size="small" @click="getDataList">检索</el-button>
            </div>
            <div class="table-wrap">
                <vxe-table
                    border
                    class="adai-table"
                    resizable
                    keep-source
                    show-overflow
                    highlight-current-row
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData"
                    :row-class-name="rowClassName"
                    @checkbox-change = "checkboxChange"
                    @checkbox-all = "checkboxChange">
                    <vxe-table-column type="checkbox" field="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column field="fileName" width="100" title="文件标题"></vxe-table-column>
                    <vxe-table-column field="Filenames" width="100" title="档名"></vxe-table-column>
                    <vxe-table-column field="_key" width="100" title="谱ID"></vxe-table-column>
                    <vxe-table-column field="surname" width="100" title="姓氏"></vxe-table-column>
                    <vxe-table-column field="genealogyName" min-width="100" title="谱名"></vxe-table-column>
                    <vxe-table-column field="publish" width="100" title="出版年"></vxe-table-column>
                    <vxe-table-column field="place" width="100" title="谱籍_现代地名"></vxe-table-column>
                    <vxe-table-column field="volume" width="100" title="卷(册)说明"></vxe-table-column>
                    <vxe-table-column field="actualVolumeNumber" width="100" title="已拍卷数"></vxe-table-column>
                    <vxe-table-column field="gcStatusO" width="100" title="开放状态"></vxe-table-column>
                    <vxe-table-column field="surplusDays" width="100" title="剩余天数"></vxe-table-column>
                    <vxe-table-column field="claimOrgName" width="100" title="认领机构"></vxe-table-column>
                    <vxe-table-column field="claimTimeO" width="100" title="认领时间"></vxe-table-column>
                    <vxe-table-column field="orgName" width="100" title="上传机构"></vxe-table-column>
                    <vxe-table-column field="action" title="操作" fixed="right" width="240" :cell-render="{name: 'AdaiActionButton2', attr: {data: actionData}, events: {'detail': showDetail, 'log': showLog, 'claim': handleCkaim, 'open': handleOpen}}"></vxe-table-column>
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
        <!-- 查看谱目 -->
        <CatalogView v-if="isShow == 1" :read="true" :dataKey="detail._key" :vid="''" v-on:close="isShow = 0" />
        <!-- 日志记录 -->
        <LogModule v-if="isShow == 2" :gid="detail._key" v-on:close="isShow = 0" />
        <!-- 领取 -->
        <ClaimBook v-if="isShow == 3" :detail="detail" :list="catalogKeyArr" v-on:close="isShow = 0" v-on:save="handleSaveClaim" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import CatalogView from '../../components/takeCamera/CatalogView.vue';
import LogModule from '../../components/discussed/LogModule.vue';
import ClaimBook from '../../components/openBook/ClaimBook.vue';

export default {
    name: "genealogyRecheck",
    components: {
        CatalogView, LogModule, Sidebar, ClaimBook,
    },
    data: () => {
        return {
            tableData: [],
            h: 1080,
            catalogKeyArr: [],

            gcKey: '',
            genealogyName: '',
            fileName: '',
            Filenames: '',
            time: [],
            startTime: '',
            endTime: '',
            orgKey: '',

            page: 1,
            pages: 0,
            total: 0,
            limit: 50,
            orgList: [],

            openStatus: 'waitOpen',
            openStatusList: [
                // {'label': '全部状态', 'value': ''},
                {'label': '待开放', 'value': 'waitOpen'},
                {'label': '已开放', 'value': 'opened'},
                {'label': '已认领', 'value': 'claimed'}
            ],
            field_main: [],
            field_branch: [],

            actionData: [{'label': '详情', 'value': 'detail'}, {'label': '记录', 'value': 'log'}, {'label': '认领', 'value': 'claim'}],
            detail: {},
            isShow: 0,
            gcStatusO: {'30': '待开放', '35': '已开放', '40': '已认领'},
        };
    },
    created:function(){
        this.h = window.innerHeight - 150;
    },
    mounted:function(){
        if(this.role >= 1 && this.role <= 3){
            this.actionData = [
                {'label': '详情', 'value': 'detail'}, 
                {'label': '记录', 'value': 'log'}, 
                {'label': '开放', 'value': 'open'}
            ];
            this.getOrgList();
        }else{
            this.openStatus = 'opened';
            this.orgKey = this.orgId;
        }

        this.getDataList();
    },
    methods:{
        async getOrgList(){// 机构列表
            let data = await api.getAxios('org?siteKey='+this.stationKey+'&name=');
            if(data.status == 200){
                this.orgList = data.data.map((ele, index)=>{
                    return {'label': ele.organizationNo+'('+ele.name+')', 'value': ele._key};
                });
                this.orgList.unshift({'label': '全部机构', 'value': ''});
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        handleSaveClaim(){
            this.isShow = 0;
            this.getDataList();
        },
        showDetail({row}){// 详情
            this.isShow = 1;
            this.detail = row;
        },
        showLog({row}){// 记录
            this.isShow = 2;
            this.detail = row;
        },
        handleCkaim({row}){// 领取
            this.detail = row;
            this.isShow = 3;
        },
        handleOpen({row}){// 开放
            this.detail = row;
            this.$confirm('本谱书符合开放条件,请确认是否开放本谱书?', '提示', {
                confirmButtonText: '确定开放',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.patchOpenGC([row._key]);
            }).catch(() => {});
        },
        handleOpenSome(){// 批量开放
            if(!this.catalogKeyArr.length){
                return ADS.message('请勾选家谱！');
            }
            this.$confirm('当前选中 '+this.catalogKeyArr.length+' 条数据, 请确认是否开放谱书?', '提示', {
                confirmButtonText: '确定开放',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.patchOpenGC(this.catalogKeyArr);
            }).catch(() => {});
        },
        handleClaimSome(){
            if(!this.catalogKeyArr.length){
                return ADS.message('请勾选家谱！');
            }
            this.detail = {};
            this.isShow = 3;
        },
        async patchOpenGC(catalogKeyArray){// 批量开放 api
            let result = await api.patchAxios('v3/review/catalog/openGC', {'userKey': this.userId, 'siteKey': this.stationKey, 'catalogKeyArray': catalogKeyArray});
            if(result.status == 200){
                if(result.data && result.data.length){
                    this.$alert(result.data.join(), '错误提示', {
                        confirmButtonText: '确定',
                        callback: action => {
                            this.getDataList();
                        }
                    });
                }else{
                    this.getDataList();
                }
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
        changePage({currentPage}){// 页码切换回调
            this.page = currentPage;
            this.getDataList();
        },
        checkboxChange({records}){// 多选
            let catalogKeyArr = [];
            records.forEach((ele) => {
                catalogKeyArr.push(ele._key);
            });
            this.catalogKeyArr = catalogKeyArr;
        },
        
        rowClassName ({ row, rowIndex }) {
            
        },
        async getDataList(){
            this.tableData = [];
            this.catalogKeyArr = [];

            let data = await api.getAxios('catalog/openGC?openStatus='+this.openStatus+'&type='+(this.role >= 1 && this.role <= 3 ? 2 : 1)+'&gcKey='+this.gcKey+'&genealogyName='+this.genealogyName+'&Filenames='+this.Filenames+'&fileName='+this.fileName+'&startTime='+this.startTime+'&endTime='+this.endTime+'&orgKey='+this.orgKey+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.tableData = data.result.list.map((ele) => {
                    ele.gcStatusO = this.gcStatusO[ele.gcStatus];
                    ele.surplusDays = Math.floor((ele.gcStatus == 30 ? ele.selfClaimTime : ele.gcStatus == 40 ? ele.otherClaimTime : 0)/24/60/60/1000);
                    ele.claimTimeO = ele.claimTime ? ADS.getLocalTime(ele.claimTime) : '';
                    return ele;
                });
                this.pages = data.result.pageNum;
                this.total = data.result.total;
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
            orgId: state => state.nav.orgId,
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
            this.getDataList();
        },
        'openStatus': function(nv, ov){
            this.actionData = [
                {'label': '详情', 'value': 'detail'}, 
                {'label': '记录', 'value': 'log'},
            ];
            if(this.role >= 1 && this.role <= 3){
                if(nv == 'waitOpen'){
                    this.actionData.push({'label': '开放', 'value': 'open'});
                }
            }else{
                if(nv == 'opened'){
                    this.actionData.push({'label': '认领', 'value': 'claim'});
                }
            }

            this.getDataList();
        },
        'orgKey': function(){
            this.getDataList();
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
            padding: 0 20px;
            width: calc(100% - 40px);
            display: flex;
            height: 50px;
            justify-content: space-between;
            align-items: center;
            .nav-left{
                position: relative;
                height: 100%;
                display: flex;
                align-items: center;
                .input{
                    position: relative;
                    width: 240px;
                    height: 30px;
                    line-height: 30px;
                    text-indent: 10px;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    outline: none;
                }
                .p{
                    font-size: 8px;
                }
            }
        }
        .search-wrap{
            position: relative;
            padding: 0 20px;
            width: calc(100% - 40px);
            display: flex;
            height: 50px;
            align-items: center;
        }
        .table-wrap{
            position: relative;
            height: calc(100% - 150px);
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
.width150{
    width: 150px;
} 
.width250{
    width: 250px;
}
.marginR10{
    margin-right: 10px;
}
</style>

