<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'系统日志'">
                <div class="toolbar">
                    <el-input class="width150" v-model="keyWord" placeholder="请输入日志内容" @change="getOperationLogList"></el-input>
                    <el-date-picker
                        v-model="time"
                        type="daterange"
                        unlink-panels
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                    />
                    <el-select class="width150" v-model="userKey" placeholder="请选择用户">
                        <el-option
                            v-for="item in siteUserList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select class="width150" v-model="orgKey" placeholder="请选择机构">
                        <el-option
                            v-for="item in orgList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-select class="width150" v-model="logType" placeholder="请选择日志类型">
                        <el-option
                            v-for="item in logTypeList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <el-button type="primary" @click="getOperationLogList">检索</el-button>
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
                    <vxe-table-column field="log" title="日志内容"></vxe-table-column>
                    <vxe-table-column field="logType" title="日志类型"></vxe-table-column>
                    <vxe-table-column field="userName" title="操作者"></vxe-table-column>
                    <vxe-table-column field="timeO" title="操作时间"></vxe-table-column>
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
            logTypeList: [{'label': '全部日志类型', 'value': ''}, 
            {'label': '新增', 'value': '新增'},
            {'label': '编辑', 'value': '编辑'},
            {'label': '删除', 'value': '删除'},
            {'label': '删除影像页表数据', 'value': '删除影像页表数据'},
            {'label': '更新卷册拍摄信息', 'value': '更新卷册拍摄信息'},
            {'label': '新增卷册', 'value': '新增卷册'},
            {'label': '更改状态', 'value': '更改状态'},
            {'label': '初审打回卷册', 'value': '初审打回卷册'},
            {'label': '机构通过卷册', 'value': '机构通过卷册'},
            {'label': '机构打回卷册', 'value': '机构打回卷册'},
            {'label': '编辑谱目', 'value': '编辑谱目'},
            {'label': '复审通过卷册', 'value': '复审通过卷册'},
            {'label': '验证设备验证码', 'value': '验证设备验证码'},
            {'label': '任务认领', 'value': '任务认领'},
            {'label': '谱目状态改变', 'value': '谱目状态改变'},
            // {'label': '', 'value': ''},
            ],
            logType: '',
            startTime: '',
            endTime: '',
            time: '',
            siteUserList: [],
            userKey: '',
            orgList: [],
            orgKey: '',
            keyWord: '',
        };
    },
    created(){
        this.h = window.innerHeight - 60 - 50;
    },
    mounted:function(){
        this.getOrgList();
        this.getSiteUser();
        this.getOperationLogList();
    },
    beforeDestroy(){
        
    },
    methods:{
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
        async getOperationLogList(){
            let result = await api.getAxios('review/operationLogList?siteKey='+this.stationKey+'&keyWord='+this.keyWord+'&orgKey='+this.orgKey+'&userKey='+this.userKey+'&logType='+this.logType+'&startTime='+this.startTime+'&endTime='+this.endTime+'&page='+this.page+'&limit='+this.limit);
            if(result.status == 200){
                this.tableData = result.data.list.map((ele)=>{
                    ele.timeO = ADS.getLocalTime(ele.time);
                    return ele;
                });
                this.pages = result.data.pageNum;
                this.total = result.data.total;
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
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
            this.getOperationLogList();
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
        }
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
.width150{
    width: 150px !important;
}
</style>

