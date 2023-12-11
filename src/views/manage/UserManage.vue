<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <div class="head-wrap">
                <div class="head-left">
                    <h3 class="title">用户管理</h3>
                </div>
                <div class="head-right">
                    <el-button v-if="(role >= 1 && role <= 2) || orgAdmin == 'admin'" class="marginLeft20" size="small" type="primary" @click="handleQuickRegister">一键注册</el-button>
                </div>
            </div>
            <div class="search-wrap">
                <div class="search-left">
                    <el-input class="width100" v-model="keyWord" placeholder="请输入姓名、手机" size="small"></el-input>
                    <vxe-checkbox v-if="stationKey == '1379194999' && role >= 1 && role <= 2" v-model="canSee" content="时光家谱"></vxe-checkbox>
                    <vxe-select v-if="this.role <=2  && this.role >= 1" v-model="userRole" placeholder="请选择微站权限">
                        <vxe-option v-for="(item,index) in userRoleList" :key="index" :value="item.value" :label="item.label"></vxe-option>
                    </vxe-select>
                    <vxe-select v-if="this.role <=2  && this.role >= 1" v-model="orgKey" placeholder="请选择机构">
                        <vxe-option v-for="(item,index) in orgList" :key="'org'+index" :value="item.value" :label="item.label"></vxe-option>
                    </vxe-select>
                    <el-button class="marginLeft20" size="small" type="primary" @click="getSiteUser()">检索</el-button>
                </div>
            </div>
            <div class="vex-table-box">
                <vxe-table
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData">
                    <vxe-table-column field="userName" title="姓名"></vxe-table-column>
                    <vxe-table-column field="accountNumber" title="账号"></vxe-table-column>
                    <vxe-table-column field="roles" title="微站权限"></vxe-table-column>
                    <vxe-table-column field="orgName" title="所属机构"></vxe-table-column>
                    <vxe-table-column field="rootStrO" title="功能权限"></vxe-table-column>
                    <vxe-table-column field="batchNum" title="上传批次"></vxe-table-column>
                    <vxe-table-column field="catalogNum" title="上传谱目"></vxe-table-column>
                    <vxe-table-column field="passNum" title="录用的谱目"></vxe-table-column>
                    <vxe-table-column v-if="((role >= 1) && role <= 2)" title="操作" width="100" :cell-render="{name: 'AdaiActionButton', attr: {data: dataAction}, events: {'editData': editData}}"></vxe-table-column>
                </vxe-table>
                <vxe-pager
                    align="center"
                    @page-change = "changePage"
                    :current-page.sync="page"
                    :page-size.sync="limit"
                    :total="total"
                    :layouts="['PrevJump', 'PrevPage', 'JumpNumber','NextPage', 'NextJump', 'FullJump', 'Total']">
                </vxe-pager>
            </div>
        </div>
        <!-- 编辑权限 -->
        <EditRoot v-if="(isShow == 1)" :detail="detail" v-on:close="(isShow = 0)" v-on:save="saveData" />
        <!-- 一键注册 -->
        <QuickRegister v-if="isShow == 2" :detail="detail" v-on:close="isShow = 0" v-on:save="handleSave" />
        <!-- loading -->
        <Loading v-show="loading" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import EditRoot from '../../components/userManage/EditRoot.vue';
import QuickRegister from '../../components/quickRegister/QuickRegister.vue';
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "userManage",
    components: {
        Sidebar, NavModal, EditRoot, QuickRegister,
    },
    data: () => {
        return {
            h: 0,
            tableData: [],
            roleO: {
                1: '超管',
                2: '管理员',
                3: '编辑',
                4: '作者',
            },
            canSee: false,
            orgList: [],
            orgKey: '',
            page: 1,
            limit: 20,
            pages: 0,
            total: 0,
            isShow: 0,
            detail: {},
            dataAction: [],
            keyWord: '',
            userRole: '',
            userRoleList: [
                {'label': '全部微站权限', 'value': ''},
                {'label': '超管', 'value': '1'},
                {'label': '管理员', 'value': '2'},
                {'label': '编辑', 'value': '3'},
                {'label': '作者', 'value': '4'},
                {'label': '普通用户', 'value': '5'},
            ],
            loading: false,
        };
    },
    created:function(){
        this.h = window.innerHeight - 160;
        if(this.role >= 1 && this.role <= 2){
            this.dataAction = [{'label': '编辑','value':'editData'}];
        }
    },
    mounted:function(){
        if(this.stationKey == '1379194999' && this.role >= 1 && this.role <= 2){
            this.getSiteSeeSG();
        }
        this.getOrgList();
        if(this.role <=2  && this.role >=1){
            
        }else{
            this.orgKey = this.orgId;
            if(this.orgAdmin == 'admin'){
                
            }else{
                
            }
        }
        this.getSiteUser();
    },
    methods:{
        changePage({currentPage}){// 页码切换回调
            this.page = currentPage;
            this.getSiteUser();
        },
        handleQuickRegister(){
            this.isShow = 2;
        },
        handleSave(data){
            this.isShow = 0;
            this.getSiteUser();
        },
        saveData(){
            this.isShow = 0;
            this.getSiteUser();
        },
        editData({row}){
            // console.log(row);
            if(row.role >= 1 && row.role <= 3){
                this.isShow = 1;
                this.detail = row;
            }else{
                this.$XModal.message({message: '只能设置微站管理员和审核员', status: 'warning'})
            }
        },
        getOrgList:async function(){
            let data = await api.getAxios('org?siteKey='+this.stationKey+'&name=');
            if(data.status == 200){
                let orgList = [{'label':'全部','value':''}];
                data.data.map((item)=>{
                    orgList.push({'label': item.name,'value': item._key});
                });
                this.orgList = orgList;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getSiteSeeSG:async function(){// 时光家谱是否显示
            let data=await api.getAxios('site/seeSg?siteKey='+this.stationKey);
            if(data.status == 200){
                this.canSee = data.canSee == 1 ? true : false;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        setSiteSeeSGting:async function(canSee){
            let data=await api.patchAxios('site/seeSg',{'siteKey':this.stationKey,'canSee':canSee ? 1 : 0});
            if(data.status == 200){
                
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getSiteUser:async function(){// 用户管理
            this.loading = true;
            let result = await api.getAxios('site/user?siteKey='+this.stationKey+'&orgKey='+this.orgKey+'&keyWord='+this.keyWord+'&userKey='+this.userId+'&userRole='+this.userRole+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(result.status == 200){
                result.data.list.map((item)=>{
                    item.accountNumber = item.mobile || item.email;
                    item.roles = this.roleO[item.role] || '普通用户';
                    item.rootStrO = item.rootStr ? item.rootStr.replace(/,/g, '') : '';
                    return item;
                });
                this.tableData = result.data.list;
                this.pages = result.data.pageNum;
                this.total = result.data.total;
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
            orgAdmin: state => state.nav.orgAdmin,
        })
    },
    watch:{
        'canSee':function(nv,ov){
            this.setSiteSeeSGting(nv);
        },
    }
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
        .head-wrap{
            position: relative;
            width: calc(100% - 40px);
            height: 40px;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .head-right{
                position: relative;
                display: flex;
                align-items: center;
            }
        }
        .search-wrap{
            position: relative;
            width: calc(100% - 40px);
            height: 40px;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .search-left{
                position: relative;
                display: flex;
                align-items: center;
            }
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 100px);
            margin-top: 20px;
        }
    }
}
.width100{
    width: 150px !important;
}
</style>

