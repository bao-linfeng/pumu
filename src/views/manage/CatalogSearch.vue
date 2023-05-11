<template>  
    <div class="wrap">
        <!-- 左侧栏 -->
        <Sidebar />
        <div class="content">
            <!-- head -->
            <div class="nav-wrap">
                <el-select class="width100" v-model="searchType" size="mini" placeholder="家谱列表">
                    <el-option
                        v-for="item in searchTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <div class="head-right">
                    <el-button type="primary" size="mini" @click="downloadExcel">导出数据</el-button>
                </div>
            </div>
            <!-- 检索输入框 -->
            <div class="search-wrap">
                <div class="search-left">
                    <el-input class="width100" size="mini" v-model="gcKey" placeholder="请输入谱ID" @change="getDataList" clearable></el-input>
                    <el-input class="width100" size="mini" v-model="genealogyName" placeholder="请输入谱名" @change="getDataList" clearable></el-input>
                    <el-input class="width100" size="mini" v-model="place" placeholder="请输入谱籍地" @change="getDataList" clearable></el-input>
                    <el-input class="width100" size="mini" v-model="surname" placeholder="请输入姓氏" @change="getDataList" clearable></el-input>
                    <el-select class="width100" size="mini" v-model="imgStatus" placeholder="影像状态">
                        <el-option
                            v-for="item in imgStatusList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-button type="primary" size="mini" @click="getDataList">检索</el-button>
                    <el-checkbox class="marginL10" size="mini" v-model="isShowSearch">展开</el-checkbox>
                </div>
                <div class="search-right">
                    <el-button class="marginL10" type="primary" size="mini" @click="toggleColumn(2)">{{visible2 ? '隐藏' : '显示'}} 折叠列</el-button>
                    <el-button class="marginL10" type="primary" size="mini" @click="toggleColumn(1)">{{visible ? '隐藏' : '显示'}} 操作列</el-button>
                </div>
            </div>
            <div class="search-wrap" v-show="isShowSearch">
                <div class="search-left">
                    <el-select class="width100" size="mini" v-model="condition" multiple placeholder="谱目状态">
                        <el-option
                            v-for="item in conditionList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select class="width100" size="mini" v-model="GCOver" placeholder="编目状态">
                        <el-option
                            v-for="item in GCOverList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select class="width100" size="mini" v-model="NoIndex" placeholder="索引状态">
                        <el-option
                            v-for="item in NoIndexList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select class="width100" size="mini" v-model="claimOrgKey" multiple placeholder="机构">
                        <el-option
                            v-for="item in orgList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-date-picker
                        class="w250"
                        size="mini"
                        v-model="updateTime"
                        type="daterange"
                        unlink-panels
                        start-placeholder="更新开始时间"
                        end-placeholder="更新结束时间"
                    />
                    <el-date-picker
                        class="w250"
                        size="mini"
                        v-model="createTime"
                        type="daterange"
                        unlink-panels
                        start-placeholder="上传开始时间"
                        end-placeholder="上传结束时间"
                    />
                </div>
            </div>
            <div class="vex-table-box" :class="{active: isShowSearch}">
                <!-- table -->
                <vxe-table
                    border
                    resizable
                    stripe
                    keep-source
                    highlight-hover-row
                    :loading="loading"
                    ref="xTable"
                    :scroll-y="{enabled: false}"
                    :height="h"
                    :align="'center'"
                    :data="tableData"
                    :row-class-name="rowClassName"
                    :cell-class-name="cellClassName"
                    @checkbox-all="selectAllEvent"
                    @checkbox-change="selectChangeEvent"
                    :sort-config="{trigger: 'cell', orders: ['desc', 'asc', 'auto'], remote: true}"
                    @sort-change="sortChangeEvent"
                    >
                    <vxe-table-column field="_key" title="谱ID" width="100" fixed="left"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="谱名" min-width="120" fixed="left"></vxe-table-column>
                    <vxe-table-column field="surname" title="姓氏" width="50" fixed="left"></vxe-table-column>
                    <vxe-table-column field="publish" title="出版年" width="100" sort-by="publish" sortable fixed="left"></vxe-table-column>
                    <vxe-table-column field="hall" title="堂号" width="100" fixed="left"></vxe-table-column>
                    <vxe-table-column field="firstAncestor" title="一世祖" width="100"></vxe-table-column>
                    <vxe-table-column field="migrationAncestor" title="始迁祖"  width="100"></vxe-table-column>
                    <vxe-table-column field="LocalityModern" title="谱籍地(原谱)" width="120"></vxe-table-column>
                    <vxe-table-column field="place" title="谱籍地(现代)" width="120"></vxe-table-column>
                    <vxe-table-column field="volume" title="卷(册)说明" width="100"></vxe-table-column>
                    <vxe-table-column field="lostVolume" title="缺卷(册)说明" width="100"></vxe-table-column>
                    <vxe-table-column field="hasVolume" title="可拍册数" width="100"></vxe-table-column>
                    <vxe-table-column field="volumeNumber" title="实拍册数" width="100"></vxe-table-column>
                    <vxe-table-column field="authors" title="作者" width="100"></vxe-table-column>
                    <vxe-table-column field="authorJob" title="作者职务" width="100"></vxe-table-column>
                    <vxe-table-column field="Dupbookid" title="重复谱ID" width="100"></vxe-table-column>
                    <vxe-table-column field="memo" title="备注" width="100"></vxe-table-column>
                    <vxe-table-column field="explain" title="说明" width="100"></vxe-table-column>
                    <vxe-table-column field="claimOrgNameO" title="供应商" width="100" :visible="visible2"></vxe-table-column>
                    <vxe-table-column field="imgNumber" title="拍数" width="100" :visible="visible2"></vxe-table-column>
                    <vxe-table-column field="updateUserName" title="更新人员" width="100" :visible="visible2"></vxe-table-column>
                    <vxe-table-column field="condition" title="谱目状态" width="100" :visible="visible2"></vxe-table-column>
                    <vxe-table-column field="GCOverO" title="编目状态" width="100" :visible="visible2"></vxe-table-column>
                    <vxe-table-column field="NoIndexO" title="索引状态" width="100" :visible="visible2"></vxe-table-column>

                    <vxe-table-column field="updateTimeO" title="更新日期" width="100" sort-by="updateTime" sortable :visible="visible2"></vxe-table-column>
                    <vxe-table-column field="createTimeO" title="上传日期" width="100" sort-by="createTime" sortable :visible="visible2"></vxe-table-column>
                    <vxe-table-column title="操作" :visible="visible" fixed="right" width="180" :cell-render="{name:'AdaiActionButton',attr:{data: attrData}, events: {'detail': getDetail, 'edit': getEdit, 'log': getLog}}"></vxe-table-column>
                </vxe-table>
                <!-- 分页 -->
                <div class="page-foot">
                    <div class="count-wrap">
                        <p>小计：共{{volumePages}}卷，{{imagePages}}拍</p>
                        <p>总计：共{{volumeTotal}}卷，{{imageTotal}}拍</p>
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
        <!-- 记录 -->
        <LogModule v-if="isShow == 3" :gid="id" v-on:close="closeModule" />
        <!-- 编辑 -->
        <EditCatalog v-if="isShow == 2" :read="isRead" :dataKey="id" :vid="''" v-on:close="closeModule" />
        <!-- 详情 -->
        <CatalogView v-if="isShow == 1" :read="isRead" :dataKey="id" :vid="''" v-on:close="closeModule" v-on:save="handleSave" />
        <!-- 加载页 -->
        <Loading v-show="Loading" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import { mapState, mapActions, mapGetters } from "vuex";
import LogModule from '../../components/discussed/LogModule.vue';
import EditCatalog from '../../components/takeCamera/EditCatalog.vue';
import CatalogView from '../../components/takeCamera/CatalogView.vue';
export default {
    name: "catalogSearch",
    components: {
        Sidebar, LogModule, EditCatalog, CatalogView, 
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
            place: '',
            surname: '',
            orgList: [],
            orgKey: '',
            claimOrgKey: [],
            condition: [],
            conditionList: [
                // {'label': '审核状态', 'value': ''},
                {'label': 'f|已完结', 'value': 'f'},
                {'label': 'nf|可拍', 'value': 'nf'},
                {'label': 'm|待议', 'value': 'm'},
                {'label': 'd|重复', 'value': 'd'},
                {'label': 'r|无效', 'value': 'r'},
            ],
            imgStatus: '1',
            imgStatusList: [
                {'label': '影像状态', 'value': ''},
                {'label': '有影像', 'value': '1'},
                {'label': '无影像', 'value': '2'},
            ],
            GCOver: '',
            GCOverList: [
                {'label': '编目状态', 'value': ''},
                {'label': '已完结', 'value': '1'},
                {'label': '未完结', 'value': '2'},
            ],
            NoIndex: '',
            NoIndexList: [
                {'label': '索引状态', 'value': ''},
                {'label': '不可索引', 'value': '1'},
                {'label': '可索引', 'value': '2'},
            ],
            updateTime: '',
            updateStartTime: '',
            updateEndTime: '',
            createTime: '',
            createStartTime: '',
            createEndTime: '',
            h: 0,
            selectRecords: [],
            id: '',
            isShow: 0,
            attrData: [
                {'label': '详情', 'value': 'detail'},
                // {'label': '编辑', 'value': 'edit'},
                {'label': '记录', 'value': 'log'},
            ],
            volumePages: 0,
            imagePages: 0,
            volumeTotal: 0,
            imageTotal: 0,
            isRead: false,
            searchType: 'catalogSearch',
            searchTypeList: [
                {'label': '家谱列表', 'value': 'catalogSearch'},
                {'label': '卷册列表', 'value': 'volumeSearch'},
            ],
            visible: false,
            visible2: false,
            Loading: false,
            isShowSearch: false,
        };
    },
    created:function(){
        this.h = window.innerHeight - 30 - 30 - 10 - 48;
    },
    mounted:function(){
        this.getOrgList();
        this.getDataList();
    },
    methods:{
        async downloadExcel(){// 下载检索结果
            this.Loading = true;
            let data = await api.getAxios('catalog/catalogListFSDownload?gcKey='+this.gcKey+'&updateStartTime='+this.updateStartTime+'&updateEndTime='+this.updateEndTime+'&createStartTime='+this.createStartTime+'&createEndTime='+this.createEndTime+'&imgStatus='+this.imgStatus+'&GCOver='+this.GCOver+'&NoIndex='+this.NoIndex+'&sortField='+this.sortField+'&sortType='+this.sortType+'&genealogyName='+this.genealogyName+'&place='+this.place+'&surname='+this.surname+'&condition='+this.condition+'&claimOrgKey='+this.claimOrgKey+'&orgKey='+this.orgKey+'&siteKey='+this.stationKey+'&limit=5000');
            this.Loading = false;
            if(data.status == 200){
                ADS.downliadLink(data.result);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        toggleColumn(f){
            if(f == 1){
                this.visible = !this.visible;
            }else{
                this.visible2 = !this.visible2;
            }
            
            this.$nextTick(() => {
                this.$refs.xTable.refreshColumn();
            });
        },
        sortChangeEvent({column, property, order, sortBy, sortList, $event}){
            console.log(property, order, sortBy);
            this.sortField = sortBy;
            this.sortType = order;

            this.getDataList();
        },
        rowClassName ({ row, rowIndex }) {
            if(row.isLook){
                return 'row-gray'
            }
        },
        cellClassName({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex }){
            if(row.changeFieldArr && row.changeFieldArr.indexOf(column.property) > -1){
                return 'row-red'
            }
            if(row.GCOver == '1' && column.property == '_key') {
                return 'row-blue'
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
                // {'label': '全部机构', 'value': ''}
                let arr = [];
                data.data.map((ele, index)=>{
                    if(ele._key == '2213544386'){

                    }else{
                        arr.push({'label': ele.organizationNo+'('+ele.name+')', 'value': ele._key});
                    }
                });
                this.orgList = arr;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async getDataList(f = true){
            this.loading = true;
            let data = await api.getAxios('catalog/catalogListFS?gcKey='+this.gcKey+'&updateStartTime='+this.updateStartTime+'&updateEndTime='+this.updateEndTime+'&createStartTime='+this.createStartTime+'&createEndTime='+this.createEndTime+'&imgStatus='+this.imgStatus+'&GCOver='+this.GCOver+'&NoIndex='+this.NoIndex+'&sortField='+this.sortField+'&sortType='+this.sortType+'&genealogyName='+this.genealogyName+'&place='+this.place+'&surname='+this.surname+'&condition='+this.condition+'&claimOrgKey='+this.claimOrgKey+'&orgKey='+this.orgKey+'&siteKey='+this.stationKey+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status == 200){
                let volumePages = 0, imagePages = 0;
                this.tableData = data.result.list.map((ele) => {
                    ele.claimOrgNameO = ele.claimOrgName + '|' + ele.claimOrganizationNo;
                    ele.GCOverO = ele.GCOver == 1 ? '已完结' : '未完结';
                    ele.NoIndexO = ele.NoIndex == 1 ? '不可索引' : '可索引';
                    volumePages = volumePages + ele.volumeNumber;
                    imagePages = imagePages + ele.imgNumber;
                    ele.createTimeO = ele.createTime ? ADS.getLocalTime(ele.createTime) : '';
                    ele.updateTimeO = ele.updateTime ? ADS.getLocalTime(ele.updateTime) : '';

                    return ele;
                });
                this.pages = data.result.pageNum;
                this.total = data.result.total;
                this.volumePages = volumePages;
                this.imagePages = imagePages;

                f ? this.getCatalogListFSStatistics() : null;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async getCatalogListFSStatistics(){
            let data = await api.getAxios('catalog/catalogListFSStatistics?gcKey='+this.gcKey+'&updateStartTime='+this.updateStartTime+'&updateEndTime='+this.updateEndTime+'&createStartTime='+this.createStartTime+'&createEndTime='+this.createEndTime+'&imgStatus='+this.imgStatus+'&GCOver='+this.GCOver+'&NoIndex='+this.NoIndex+'&sortField='+this.sortField+'&sortType='+this.sortType+'&genealogyName='+this.genealogyName+'&place='+this.place+'&surname='+this.surname+'&condition='+this.condition+'&claimOrgKey='+this.claimOrgKey+'&orgKey='+this.orgKey+'&siteKey='+this.stationKey+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.volumeTotal = data.result.totalVolume;
                this.imageTotal = data.result.totalImg;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        handlePageChange({ currentPage, pageSize }){
            this.page = currentPage;
            this.getDataList(false);
        },
        getDetail({row, column}){
            this.id = row._key;
            this.isShow = 1;
            this.isRead = true;
        },
        getEdit({row}){
            this.id = row._key;
            this.isShow = 2;
        },
        getLog({row}){
            this.id = row._key;
            this.isShow = 3;
        },
        closeModule(data){
            console.log(data);
            this.isShow = 0;
            this.isRead = false;
            if(data){
                this.getDataList();
            }
        },
        handleSave(){

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
        'updateTime': function(nv, ov){
            console.log(nv);
            if(nv){
                this.updateStartTime = new Date(nv[0]).getTime();
                this.updateEndTime = new Date(nv[1]).getTime();
            }else{
                this.updateStartTime = '';
                this.updateEndTime = '';
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
        'searchType': function(nv, ov){
            this.$router.push('/'+this.pathname+'/'+nv);
        },
        'isShowSearch': function(nv, ov){
            if(nv){
                this.h = this.h - 30;
            }else{
                this.h = this.h + 30;
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
            height: 30px;
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
            height: 30px;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .search-left{
                display: flex;
                align-items: center;
            }
            .search-right{
                display: flex;
                align-items: center;
            }
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 70px);
            margin-top: 10px;
            &.active{
                height: calc(100% - 100px);
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
.w250{
    width: 250px !important;
}
.marginR10{
    margin-right: 10px;
}
.marginL10{
    margin-left: 10px;
}
</style>

