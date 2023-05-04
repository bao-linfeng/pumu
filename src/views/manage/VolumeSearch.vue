<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <div class="nav-wrap">
                <!-- <span class="title">家谱列表</span> -->
                <el-select class="width100" v-model="searchType" placeholder="家谱列表">
                    <el-option
                        v-for="item in searchTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <div class="head-right">
                    <el-button type="primary" size="medium">导出数据</el-button>
                </div>
            </div>
            <div class="search-wrap">
                <el-input class="width100" v-model="gcKey" placeholder="请输入谱ID" @change="getDataList" clearable></el-input>
                <el-input class="width100" v-model="genealogyName" placeholder="请输入谱名" @change="getDataList" clearable></el-input>
                <el-input class="width100" v-model="volumeNumber" placeholder="请输入卷名" @change="getDataList" clearable></el-input>
                <el-input class="width100" v-model="volumeKey" placeholder="请输入卷ID" @change="getDataList" clearable></el-input>
                <el-select class="width100" v-model="takeStatus" multiple placeholder="卷审核状态">
                    <el-option
                        v-for="item in takeStatusList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-select class="width100" v-model="orgKey" placeholder="机构">
                    <el-option
                        v-for="item in orgList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <!-- <el-date-picker
                    v-model="time"
                    type="daterange"
                    unlink-panels
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                /> -->
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
                    <!-- <vxe-table-column type="checkbox" width="60"></vxe-table-column> -->
                    <vxe-table-column field="volumeKey" title="卷ID"></vxe-table-column>
                    <vxe-table-column field="volumeNumber" title="卷名"></vxe-table-column>
                    <vxe-table-column field="internalSerialNumber" title="卷序号"></vxe-table-column>
                    <vxe-table-column field="gcKey" title="谱ID"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="谱名"></vxe-table-column>
                    <vxe-table-column field="isLeadImagesO" title="电子谱"></vxe-table-column>
                    <vxe-table-column field="singleOrTwoO" title="单双拍"></vxe-table-column>
                    <vxe-table-column field="imgNumber" title="拍数"></vxe-table-column>
                    <vxe-table-column field="takeStatusO" title="卷审核状态"></vxe-table-column>
                    <vxe-table-column field="claimOrgNameO" title="所属机构"></vxe-table-column>
                    <vxe-table-column field="createTimeO" title="上传时间" sort-by="createTime" sortable></vxe-table-column>
                    <vxe-table-column field="memo" title="备注"></vxe-table-column>
                    <vxe-table-column title="操作" width="130" :cell-render="{name:'AdaiActionButton',attr:{data: attrData}, events: {'log': getLog, 'image': getImage}}"></vxe-table-column>
                </vxe-table>
                <div class="page-foot">
                    <div class="count-wrap">
                        <p>小计：共{{imagePages}}拍</p>
                        <p>总计：共{{imageTotal}}拍</p>
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
        <!-- <Loading v-show="loading" /> -->
        <!-- 记录 -->
        <logModule v-if="isShow == 1" :id="id" v-on:close="isShow = 0" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import { mapState, mapActions, mapGetters } from "vuex";
import logModule from '../../components/takeCamera/logModule.vue';
import CatalogView from '../../components/takeCamera/CatalogView.vue';
export default {
    name: "catalogSearch",
    components: {
        Sidebar, logModule, CatalogView, 
    },
    data: () => {
        return {
            loading: false,
            tableData: [],
            page: 1,
            pages: 0,
            limit: 20,
            total: 0,
            sortField: '',
            sortType: '',
            genealogyName: '',
            gcKey: '',
            volumeNumber: '',
            volumeKey: '',
            orgList: [],
            orgKey: '',
            claimOrgKey: '',
            takeStatus: [],
            takeStatusList: [
                // {'label': '审核状态', 'value': ''},
                {'label': '机构审核', 'value': '12'},
                {'label': '微站初审', 'value': '5'},
                {'label': '微站复审', 'value': '13'},
                {'label': '微站待议', 'value': '14'},
                {'label': '打回', 'value': '6'},
                {'label': '审核通过', 'value': '7'},
                {'label': '作废', 'value': '16'},
            ],
            time: '',
            startTime: '',
            endTime: '',
            h: 0,
            selectRecords: [],
            id: '',
            isShow: 0,
            attrData: [
                {'label': '记录', 'value': 'log'},
                {'label': '影像', 'value': 'image'},
            ],
            imagePages: 0,
            imageTotal: 0,
            attr: [{'fieldMeans': '状态', 'fieldName': 'takeStatus'}],

            searchType: 'volumeSearch',
            searchTypeList: [
                {'label': '家谱列表', 'value': 'catalogSearch'},
                {'label': '卷册列表', 'value': 'volumeSearch'},
            ],
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
        sortChangeEvent({column, property, order, sortBy, sortList, $event}){
            console.log(property, order, sortBy);
            this.sortField = sortBy;
            this.sortType = order;

            this.getDataList();
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
                this.orgList.unshift({'label': '全部机构', 'value': ''});
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async getDataList(f = true){
            this.loading = true;
            let data = await api.getAxios('catalog/volumeListFS?gcKey='+this.gcKey+'&sortField='+this.sortField+'&sortType='+this.sortType+'&genealogyName='+this.genealogyName+'&volumeNumber='+this.volumeNumber+'&volumeKey='+this.volumeKey+'&takeStatus='+this.takeStatus+'&claimOrgKey='+this.claimOrgKey+'&orgKey='+this.orgKey+'&siteKey='+this.stationKey+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status == 200){
                let imagePages = 0;
                let O = {'12': '机构审核', '5': '微站初审', '13': '微站复审', '14': '微站待议', '6': '打回', '7': '审核通过', '16': '作废'};
                this.tableData = data.result.list.map((ele) => {
                    imagePages = imagePages + ele.imgNumber;
                    ele.claimOrgNameO = ele.claimOrgName + '|' + ele.claimOrganizationNo;
                    ele.isLeadImagesO = ele.isLeadImages == 1 ? '电子谱' : '纸谱';
                    ele.singleOrTwoO = ele.singleOrTwo == 1 ? '单拍' : ele.singleOrTwo == 2 ? '双拍' : '';
                    ele.takeStatusO = O[ele.takeStatus];
                    ele.createTimeO = ele.createTime ? ADS.getLocalTime(ele.createTime) : '';

                    return ele;
                });
                this.pages = data.result.pageNum;
                this.total = data.result.total;
                this.imagePages = imagePages;

                f ? this.getVolumeListFSStatistics() : null;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async getVolumeListFSStatistics(){
            let data = await api.getAxios('catalog/volumeListFSStatistics?gcKey='+this.gcKey+'&sortField='+this.sortField+'&sortType='+this.sortType+'&genealogyName='+this.genealogyName+'&volumeNumber='+this.volumeNumber+'&volumeKey='+this.volumeKey+'&takeStatus='+this.takeStatus+'&claimOrgKey='+this.claimOrgKey+'&orgKey='+this.orgKey+'&siteKey='+this.stationKey+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.imageTotal = data.result.totalImg;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        handlePageChange({ currentPage, pageSize }){
            this.page = currentPage;
            this.getDataList(false);
        },
        getImage({row}){
            window.open('/'+this.pathname+'/cameraImage?vid='+row.volumeKey+'&gid='+row.gcKey+'&genealogyName='+row.genealogyName);
        },
        getLog({row}){
            this.id = row.volumeKey;
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
        'searchType': function(nv, ov){
            this.$router.push('/'+this.pathname+'/'+nv);
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
    .count-wrap{
        font-size: 10px;
        font-weight: bold;
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

