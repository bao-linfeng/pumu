<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'上传报错卷册'">
                <div class="toolbar">
                    <input class="search-input" type="text" v-model="genealogyName" placeholder="谱名" />
                    <!-- <input class="search-input" type="text" v-model="surname" placeholder="姓氏" />
                    <input class="search-input" type="text" v-model="place" placeholder="谱籍地" />
                    <input class="search-input" type="text" v-model="publish" placeholder="出版时间" />
                    <input class="search-input" type="text" v-model="hall" placeholder="堂号" /> -->
                    <el-button type="primary" @click="getDataList">检索</el-button>
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
                    <vxe-table-column field="genealogyName" title="谱名"></vxe-table-column>
                    <!-- <vxe-table-column field="surname" title="姓氏"></vxe-table-column> -->
                    <vxe-table-column field="place" title="谱籍地"></vxe-table-column>
                    <vxe-table-column field="publish" title="出版时间"></vxe-table-column>
                    <vxe-table-column field="hall" title="堂号"></vxe-table-column>
                    <vxe-table-column field="volumeNumber" title="卷名"></vxe-table-column>
                    <vxe-table-column field="reason" title="报错原因"></vxe-table-column>
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
    name: "volumeError",
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
            startTime: '',
            endTime: '',
            time: '',
            userKey: '',

            genealogyName: '',
            hall: '',
            publish: '',
            surname: '',
            place: '',
            actionData: [{'label': '恢复', 'value': 'resume'}],
        };
    },
    created(){
        this.h = window.innerHeight - 60 - 50;
    },
    mounted:function(){
        this.getDataList();
    },
    beforeDestroy(){
        
    },
    methods:{
        async getDataList(){
            let data = await api.getAxios('v3/camera/catalog/reasonList?genealogyName='+this.genealogyName+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.tableData = data.result.list;
                this.pages = data.result.pageNum;
                this.total = data.result.total;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        changePage({currentPage}){// 页码切换回调
            this.page = currentPage;
            this.getDataList();
        },
        handleResume({row}){
            this.$confirm('此操作将恢复该卷册的上传状态, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.patchUpdateReason(row.volumeKey);
            }).catch(() => {});
        },
        async patchUpdateReason(volumeKey){
            let result = await api.patchAxios('v3/camera/catalog/updateReason', {'volumeKey': volumeKey, 'reason': ''});
            if(result.status == 200){
                this.getDataList();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
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
    width: 200px;
    height: 40px;
    line-height: 40px;
    border-radius: 3px;
    border: 1px solid #ddd;
    text-indent: 10px;
    outline: none;
}
</style>

