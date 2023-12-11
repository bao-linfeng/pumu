<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'回收站'">
                <div class="toolbar">
                    <!-- <el-date-picker
                        v-model="time"
                        type="daterange"
                        unlink-panels
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                    />
                    <el-select v-model="userKey" placeholder="请选择用户">
                        <el-option
                            v-for="item in siteUserList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select v-model="orgKey" placeholder="请选择机构">
                        <el-option
                            v-for="item in orgList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select> -->
                    <input class="search-input" v-if="type == 1" type="text" v-model="catalogKey" placeholder="谱ID" />
                    <input class="search-input" v-if="type == 1" type="text" v-model="genealogyName" placeholder="谱名" />
                    <input class="search-input" v-if="type == 1" type="text" v-model="surname" placeholder="姓氏" />
                    <input class="search-input" v-if="type == 1" type="text" v-model="place" placeholder="谱籍地" />
                    <input class="search-input" v-if="type == 1" type="text" v-model="publish" placeholder="出版时间" />
                    <input class="search-input" v-if="type == 1" type="text" v-model="hall" placeholder="堂号" />
                    <input class="search-input" v-if="type == 2" type="text" v-model="fileName" placeholder="文件标题" />
                    <el-select v-model="type" placeholder="请选择类型">
                        <el-option
                            v-for="item in typeList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-button type="primary" @click="handleSeach">检索</el-button>
                </div>
            </NavModal>
            <div class="vex-table-box">
                <vxe-table
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    row-key
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData">
                    <vxe-table-column v-if="type == 1" field="genealogyName" title="谱名"></vxe-table-column>
                    <vxe-table-column v-if="type == 1" field="oldGCKey" title="谱ID"></vxe-table-column>
                    <vxe-table-column v-if="type == 1" field="surname" title="姓氏"></vxe-table-column>
                    <vxe-table-column v-if="type == 1" field="place" title="谱籍地"></vxe-table-column>
                    <vxe-table-column v-if="type == 1" field="publish" title="出版时间"></vxe-table-column>
                    <vxe-table-column v-if="type == 1" field="hall" title="堂号"></vxe-table-column>
                    <vxe-table-column v-if="type == 2" field="fileName" title="文件标题"></vxe-table-column>
                    <vxe-table-column field="deleteUserName" title="删除人"></vxe-table-column>
                    <vxe-table-column field="deleteTimeO" title="删除时间"></vxe-table-column>
                    <vxe-table-column title="操作" width="100" :cell-render="{name: 'AdaiActionButton', attr: {data:actionData}, events: {'resume': handleResume}}"></vxe-table-column>
                </vxe-table>
                <vxe-pager
                    align="right"
                    @page-change = "changePage"
                    :current-page.sync="page"
                    :page-size.sync="limit"
                    :total="total"
                    :layouts="['PrevJump', 'PrevPage', 'JumpNumber','NextPage', 'NextJump', 'FullJump', 'Total']">
                </vxe-pager>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "LogManage",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            tableData: [],
            h:300,
            page: 1,
            pages: 0,
            limit: 30,
            total: 0,
            typeList: [
                {'label': '谱目', 'value': '1'}, 
                {'label': '批次', 'value': '2'}
            ],
            type: '1',
            startTime: '',
            endTime: '',
            time: '',
            siteUserList: [],
            userKey: '',
            orgList: [],
            orgKey: '',
            catalogKey: '',
            genealogyName: '',
            hall: '',
            publish: '',
            surname: '',
            place: '',
            fileName: '',
            actionData: [{'label':'恢复','value':'resume'}],
        };
    },
    created(){
        this.h = window.innerHeight - 60 - 50;
    },
    mounted:function(){
        this.handleSeach();
    },
    beforeDestroy(){
        
    },
    methods:{
        handleSeach(){
            this.type == 1 ? this.getDeleteCatalogList() : this.getDeleteBatchList();
        },
        async getDeleteCatalogList(){
            let data = await api.getAxios('deleteCatalogList?genealogyName='+this.genealogyName+'&catalogKey='+this.catalogKey+'&hall='+this.hall+'&publish='+this.publish+'&surname='+this.surname+'&place='+this.place+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.tableData = data.result.list.map((ele) => {
                    ele.deleteTimeO = ele.deleteTime ? ADS.getLocalTime(ele.deleteTime) : '';
                    return ele;
                });
                this.pages = data.result.pageNum;
                this.total = data.result.total;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async getDeleteBatchList(){
            let data = await api.getAxios('deleteBatchList?fileName='+this.fileName+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.tableData = data.result.list.map((ele) => {
                    ele.deleteTimeO = ele.deleteTime ? ADS.getLocalTime(ele.deleteTime) : '';
                    return ele;
                });
                this.pages = data.result.pageNum;
                this.total = data.result.total;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async restoreGC(deleteGCKey){
            let data = await api.patchAxios('restoreGC', {'deleteGCKey': deleteGCKey});
            if(data.status == 200){
                this.handleSeach();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async restoreBatch(deleteBatchKey){
            let data = await api.patchAxios('restoreBatch', {'deleteBatchKey': deleteBatchKey});
            if(data.status == 200){
                this.handleSeach();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async handleResume({row}){
            console.log(row);
            this.type == 1 ? this.restoreGC(row._key) : this.restoreBatch(row._key);
        },
        async getOrgList(){// 机构列表
            let data = await api.getAxios('org?siteKey='+this.stationKey+'&name=');
            if(data.status == 200){
                this.orgList = data.data.map((ele, index)=>{
                    return {'label': ele.organizationNo, 'value': ele._key};
                });
                this.orgList.unshift({'label': '全部机构', 'value': ''});
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async getSiteUser(){
            let result = await api.getAxios('site/user?siteKey='+this.stationKey+'&orgKey=&userKey='+this.userId+'&userRole='+this.role+'&page=1&limit=100');
            if(result.status == 200){
                this.siteUserList = result.data.list.map((ele) => {
                    return {'label': ele.userName, 'value': ele._key};
                });
                this.siteUserList.unshift({'label': '全部用户', 'value': ''});
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        changePage({currentPage}){// 页码切换回调
            this.page = currentPage;
            this.handleSeach();
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            role: state => state.nav.role,
            stationKey: state => state.nav.stationKey,
            orgId: state => state.nav.orgId,
            orgAdmin: state => state.nav.orgAdmin,
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
        'type': function(nv, ov){
            this.page = 1;
            this.handleSeach();
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
        }
        .vex-table-box{
            width: calc(100% - 40px);
            height: calc(100% - 120px);
            margin: 0 auto;
        }
    }
}
.toolbar{
    display: flex;
    align-items: center;
}
.search-input{
    width: 150px;
    height: 30px;
    line-height: 30px;
    border-radius: 3px;
    border: 1px solid #ddd;
    text-indent: 10px;
    outline: none;
}
</style>

