<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <div class="nav-wrap">
                <span class="title">单谱快捷查询</span>
                <div class="head-right">
                    
                </div>
            </div>
            <div class="search-wrap">
                <div class="search-box" v-for="(item, i) in searchArr" :key="i">
                    <el-input class="width100" v-model="searchObject[item.value]" :placeholder="'请输入'+item.label" clearable></el-input>
                    <el-checkbox class="margin10" v-model="item.check"></el-checkbox>
                </div>
                
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
                    :sort-config="{trigger: 'cell', orders: ['desc', 'asc', 'auto'], remote: true}"
                    @sort-change="sortChangeEvent"
                    >
                    <vxe-table-column field="_key" title="谱ID"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="谱名"></vxe-table-column>
                    <vxe-table-column field="surname" title="姓氏"></vxe-table-column>
                    <vxe-table-column field="place" title="谱籍地(现代)"></vxe-table-column>
                    <vxe-table-column field="LocalityModern" title="谱籍地(原谱)"></vxe-table-column>
                    <vxe-table-column field="publish" title="出版年"></vxe-table-column>
                    <vxe-table-column field="volume" title="卷数"></vxe-table-column>
                    <vxe-table-column field="lostVolume" title="缺卷"></vxe-table-column>
                    <vxe-table-column field="hall" title="堂号"></vxe-table-column>
                    <vxe-table-column field="authors" title="作者姓名"></vxe-table-column>
                    <vxe-table-column field="authorJob" title="作者职务"></vxe-table-column>
                    <vxe-table-column field="firstAncestor" title="一世祖"></vxe-table-column>
                    <vxe-table-column field="migrationAncestor" title="始迁祖"></vxe-table-column>
                    <vxe-table-column field="hasVolume" title="实拍册数"></vxe-table-column>
                    <vxe-table-column field="memo" title="备注"></vxe-table-column>
                    <vxe-table-column field="explain" title="说明"></vxe-table-column>
                    <vxe-table-column field="condition" title="谱状态"></vxe-table-column>
                    <vxe-table-column field="claimOrgNameO" title="供应商"></vxe-table-column>
                    <vxe-table-column field="createTimeO" title="上传时间" sort-by="createTime" sortable></vxe-table-column>
                    <vxe-table-column title="操作" fixed="right" width="180" :cell-render="{name:'AdaiActionButton',attr:{data: attrData}, events: {'detail': getDetail, 'edit': getEdit, 'log': getLog}}"></vxe-table-column>
                </vxe-table>
                <div class="page-foot">
                    <div class="count-wrap">
                        
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
        <LogModule v-if="isShow == 3" :gid="id" v-on:close="closeModule" />
        <!-- 编辑 -->
        <EditCatalog v-if="isShow == 2" :read="isRead" :attr="attr" :dataKey="id" :vid="''" v-on:close="closeModule" />
        <!-- 详情 -->
        <CatalogView v-if="isShow == 1" :read="isRead" :dataKey="id" :vid="''" v-on:close="closeModule" v-on:save="handleSave" />
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
    name: "singleQuickSearch",
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
            searchArr: [
                {'label': '作者', 'value': 'authors', 'check': true},
                {'label': '谱名', 'value': 'genealogyName', 'check': true},
                {'label': '姓氏', 'value': 'surname', 'check': true},
                {'label': '谱籍地(现)', 'value': 'place', 'check': true},
                {'label': '谱籍地(原)', 'value': 'LocalityModern', 'check': true},
                {'label': '堂号', 'value': 'hall', 'check': true},
                {'label': '始迁祖', 'value': 'migrationAncestor', 'check': true},
                {'label': '一世祖', 'value': 'firstAncestor', 'check': true},
                {'label': '卷数', 'value': 'volume', 'check': true},
                {'label': '出版年', 'value': 'publish', 'check': true},
            ],
            searchObject: {

            },
            time: '',
            startTime: '',
            endTime: '',
            h: 0,
            id: '',
            isShow: 0,
            attrData: [
                {'label': '详情', 'value': 'detail'},
                {'label': '编辑', 'value': 'edit'},
                {'label': '记录', 'value': 'log'},
            ],
            isRead: false,
            attr: [{'fieldMeans': '状态', 'fieldName': 'condition'}],
        };
    },
    created:function(){
        this.h = window.innerHeight - 50 - 50 - 50 - 48;
    },
    mounted:function(){
        this.id = ADS.getQueryVariable('id');
        this.getGenealogyDetail();
    },
    methods:{
        async getGenealogyDetail(){
            const result = await api.getAxios('catalog/detail?catalogKey='+this.id);
            if(result.status == 200){
                let searchObject = {};
                this.searchArr.forEach((ele, i) => {
                    searchObject[ele.value] = result.data[ele.value] || '';
                });
                this.searchObject = searchObject;

                this.getDataList();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        sortChangeEvent({column, property, order, sortBy, sortList, $event}){
            console.log(property, order, sortBy);
            this.sortField = sortBy;
            this.sortType = order;

            this.getDataList();
        },
        async getDataList(){
            console.log(this.searchArr);
            let searchObject = {};
            this.searchArr.forEach((ele, i) => {
                if(ele.check){
                    searchObject[ele.value] = this.searchObject[ele.value];
                }
            });
            this.loading = true;
            let data = await api.postAxios('catalog/singleGCQuickQuery',{
                'searchObject': searchObject,
                'targetGCKey': this.id,
                'page': this.page,
                'limit': this.limit,
            });
            this.loading = false;
            if(data.status == 200){
                this.tableData = data.result.list.map((ele) => {
                    ele.claimOrgNameO = ele.claimOrgName + '|' + ele.claimOrganizationNo;
                    ele.createTimeO = ele.createTime ? ADS.getLocalTime(ele.createTime) : '';

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
            this.getDataList();
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
            // width: calc(100% - 40px);
            width: 900px;
            height: 100px;
            padding: 0 20px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            flex-wrap: wrap;
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 150px);
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
.margin10{
    margin: 0 10px 0 5px;
}
</style>

