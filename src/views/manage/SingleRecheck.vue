<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <div class="nav-wrap">
                <span class="title">单谱查重列表</span>
                <div class="head-right">
                    <!-- <el-button type="primary" size="medium">审核</el-button> -->
                </div>
            </div>
            <div class="search-wrap">
                <el-input class="width100" v-model="gcKey" placeholder="请输入谱ID" @change="getDataList"></el-input>
                <el-input class="width100" v-model="genealogyName" placeholder="请输入谱名" @change="getDataList"></el-input>
                <el-select class="width100" v-if="role >= 1 && role <= 3" v-model="orgKey" placeholder="机构">
                    <el-option
                        v-for="item in orgList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select class="width100" v-model="hitTarget" placeholder="命中状态">
                    <el-option
                        v-for="item in hitTargetList"
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
                <el-button type="primary" size="medium" @click="getDataList">检索</el-button>
            </div>
            <div class="vex-table-box">
                <vxe-table
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
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column field="gcKey" title="谱ID"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="谱名"></vxe-table-column>
                    <vxe-table-column field="applyUserName" title="操作人"></vxe-table-column>
                    <vxe-table-column field="hitTargetNumber" title="命中条数"></vxe-table-column>
                    <vxe-table-column field="applyTimeO" title="操作时间"></vxe-table-column>
                    <vxe-table-column title="操作" width="200" :cell-render="{name:'AdaiActionButton',attr:{data: actionData},events:{'look': lookEvent, 'lookBook': lookBook}}"></vxe-table-column>
                </vxe-table>
                <div class="page-foot">
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
        <Loading v-show="loading" />
        <RecheckList v-if="isShow == 1" :id="checkTaskKey" v-on:close="isShow = 0" />
        <!-- 查看谱目 -->
        <CatalogView v-if="isShow == 2" :read="isRead" :dataKey="dataKey" :vid="''" v-on:close="isShow = 0" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import RecheckList from '../../components/singleRecheck/RecheckList.vue';
import CatalogView from '../../components/takeCamera/CatalogView.vue';
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "singleRecheck",
    components: {
        Sidebar, RecheckList, CatalogView, 
    },
    data: () => {
        return {
            loading: false,
            tableData: [],
            actionData: [
                {'label': '查重结果', 'value': 'look'}, 
                {'label': '详情', 'value': 'lookBook'}
            ],
            page: 1,
            pages: 0,
            limit: 20,
            total: 0,
            searchField: '',
            searchValue: '',
            genealogyName: '',
            gcKey: '',
            place: '',
            orgList: [],
            orgKey: '',
            hitTarget: '1',
            hitTargetList: [
                {'label': '命中状态', 'value': ''},
                {'label': '命中', 'value': '1'},
                {'label': '未命中', 'value': '2'},
            ],
            time: '',
            startTime: '',
            endTime: '',
            h: 0,
            selectRecords: [],
            checkTaskKey: '',
            isShow: 0,
            isRead: true,
            dataKey: '',
        };
    },
    created:function(){
        this.h = window.innerHeight - 50 - 50 - 48;
    },
    mounted:function(){
        this.getOrgList();
        this.getDataList();
    },
    methods:{
        lookBook({ row }){
            this.dataKey = row.gcKey;
            this.isShow = 2;
        },
        sortChangeEvent({column, property, order, sortBy, sortList, $event}){
            console.log(property, order, sortBy);
            this.sortField = sortBy;
            this.sortType = order;
        },
        rowClassName ({ row, rowIndex }) {
            if(row.GCOver == '1') {
                return 'row-blue'
            }
            if(row.isLook){
                return 'row-gray'
            }
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
        async getDataList(){
            let data = await api.getAxios('data/checkTaskList?gcKey='+this.gcKey+'&hitTarget='+this.hitTarget+'&applyStartTime='+this.startTime+'&applyEndTime='+this.endTime+'&orgKey='+this.orgKey+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.tableData = data.result.list.map((ele) => {
                    ele.applyTimeO = ele.applyTime ? ADS.getLocalTime(ele.applyTime) : '';
                    ele.checkTimeO = ele.checkTime ? ADS.getLocalTime(ele.checkTime) : '';

                    return ele;
                });
                this.pages = data.result.pageNum;
                this.total = data.result.total;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        handlePageChange({ currentPage, pageSize }){
            this.page = currentPage;
        },
        lookEvent({row}){
            this.checkTaskKey = row._key;
            this.isShow = 1;
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
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 100px);
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

