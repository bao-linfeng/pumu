<template>  
    <div class="wrap">
        <!-- 侧边栏 -->
        <Sidebar />
        <div class="content">
            <!-- 导航 -->
            <NavModal title="本站家谱" />
            <!-- 检索模块 -->
            <SearchModal :fieldFilters="fieldFilters" v-on:get-genealogy="getGenealogy" v-on:change-parameters="changeParameters" />
            <div class="btn_wrap_left">
                <input v-if="this.role >=1 && this.role <= 2" class="root" type="button" value="前台公开" @click="openRootModal" />
                <input v-if="stationKey == '1379194999'" class="swap" type="button" value="家谱分发" @click="openSiteModal(false)" />
                <input v-if="stationKey == '1379194999'" class="swap" type="button" value="全部分发" @click="openSiteModal(true)" />
                <input v-else class="swap" type="button" value="交换家谱" @click="openSwapModal" />
                <el-button size="small" type="primary" v-if="this.role >=1 && this.role <= 3" @click="downloadExcel">下载检索结果</el-button>
                <LinkView class="marginLeft20" />
                <el-button class="marginLeft20" size="small" type="primary" @click="isEdit = true">编辑的家谱</el-button>
            </div>
            <!-- 家谱table -->
            <GenealogyTableModal v-if="fieldFilters.length" :fieldFilters="fieldFilters" :total="total" :list="list" v-on:checkbox-change="checkboxChange" v-on:get-genealogy="getJiapuList" />
            <vxe-pager
                align="center"
                @page-change = "changePage"
                :current-page.sync="page"
                :page-size.sync="limit"
                :total="total"
                :layouts="['PrevJump', 'PrevPage', 'JumpNumber','NextPage', 'NextJump', 'Sizes', 'FullJump', 'Total']">
            </vxe-pager>
        </div>
        <!-- 分级公开 -->
        <RootModal v-if="isRootShow" :checkList="checkList" :siteKey="stationKey" v-on:close-root="isRootShow=false" v-on:save-root="saveRoot" />
        <!-- 家谱分发 -->
        <SitePerspectiveModal v-if="isSitePerspective" :checkList="checkList" v-on:close-site="isSitePerspective=false" />
        <!-- 家谱交换 -->
        <SwapModal v-if="isSwapModal" :checkList="checkList" v-on:close-site="isSwapModal=false" />
        <!-- 编辑的家谱 -->
        <EditGenealogyListModal v-if="isEdit" v-on:close-edit-list="isEdit = false" :fieldFilters="fieldFilters" />
        <!-- loading -->
        <Loading v-show="loading" />
        <div class="process-wrap" v-if="bindPage && bindPage < bindTotal">
            <el-button class="reconnect" type="primary" @click="reconnect">重新连接</el-button>
            <el-progress type="circle" :percentage="Number((100*bindPage/bindTotal).toFixed(2))"></el-progress>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import SearchModal from "../../components/myGenealogy/SearchModal.vue";
import GenealogyTableModal from "../../components/myGenealogy/GenealogyTableModal.vue";
import RootModal from "../../components/myGenealogy/RootModal.vue";
import SwapModal from "../../components/myGenealogy/SwapModal.vue";
import SitePerspectiveModal from "../../components/myGenealogy/SitePerspectiveModal.vue";
import LinkView from "../../components/myGenealogy/LinkView.vue";
import EditGenealogyListModal from "../../components/myGenealogy/EditGenealogyListModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "baseGenealogy",
    components: {
        Sidebar,NavModal,SearchModal,GenealogyTableModal,RootModal,SwapModal,SitePerspectiveModal,LinkView,EditGenealogyListModal
    },
    data: () => {
        return {
            keyWordObj: '',
            libKey: '',
            equal: 1,
            orgKey: '',
            prop: '',
            order: '',
            page: 1,
            limit: 20,
            list:[],
            total:0,
            fieldFilters:[],
            loading: false,
            isRootShow:false,
            checkList:[],
            isSwapModal:false,
            isSitePerspective:false,
            begYear: '',
            endYear: '',
            noPublishAD: '',
            isEdit: false,
        };
    },
    created:function(){
        this.getOrgInfo();
    },
    mounted:function(){
        this.getFieldFilterList();
        // this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
    },
    methods:{
        reconnect(){
            this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
        },
        getOrgInfo:async function(){
            let data = await api.getAxios('org/member/info?siteKey='+this.stationKey+'&userKey='+this.userId);
            if(data.status == 200){
                this.$store.dispatch('setPropertyValue',{'property':'orgAdmin','value': data.data.role});
                window.localStorage.setItem('orgAdmin',data.data.role);
                this.$store.dispatch('setPropertyValue',{'property':'orgId','value': data.data.orgKey});
                window.localStorage.setItem('orgId',data.data.orgKey);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        downloadExcel:async function(){// 下载检索结果
            this.loading = true;
            let data=await api.postAxios('data/download',{'siteKey': this.stationKey,
            'noPublishAD': this.noPublishAD,
            'begYear': this.begYear,
            'endYear': this.endYear,
            'libKey': this.libKey,
            'orgKey': this.orgKey,
            'equal': this.equal,
            'prop': this.prop,
            'order': this.order,
            'keyWordObj': this.keyWordObj});
            this.loading = false;
            if(data.status == 200){
                ADS.downliadLink(data.result);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        checkboxChange(data){// 复选框切换回调
            console.log(data);
            this.checkList = data;
        },
        saveRoot(){//分级公开
            this.isRootShow = false;
            this.getJiapuList();
        },
        changePage({currentPage}){// 页码切换回调
            this.page = currentPage;
            this.getJiapuList();
        },
        getJiapuList:async function(){// 谱目列表
            this.loading = true;
            let data=await api.getAxios('catalog/back?siteKey='+this.stationKey+'&noPublishAD='+this.noPublishAD+'&begYear='+this.begYear+'&endYear='+this.endYear+'&libKey='+this.libKey+'&orgKey='+this.orgKey+'&equal='+this.equal+'&keyWordObj='+JSON.stringify(this.keyWordObj)+'&prop='+this.prop+'&order='+this.order+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status == 200){
                this.list = data.result.list;
                this.list.map((item)=>{
                    item.address = (item.prov || '') + ' ' + (item.city || '') + ' ' + (item.district || '');
                    item.hasImage = item.hasImage == 1 ? '有' : '无';
                    item.libsStr = item.libs.join(',');
                });
                this.total = data.result.total;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getFieldFilterList:async function(){// 检索字段列表
            let data=await api.getAxios('field/filter?type=家谱&asSearch=1');
            if(data.status == 200){
                let fieldFilters = [];
                data.data.map((item)=>{fieldFilters.push({'label':item.fieldMeans,'value':item.fieldName})});
                this.fieldFilters = fieldFilters;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getGenealogy(data){// 检索家谱
            let keyWordObj = {};
            this.libKey = data['libKey'];
            this.equal = data['equal'];
            this.orgKey = data['orgKey'];
            this.begYear = data['begYear'] || '';
            this.endYear = data['endYear'] || '';
            this.noPublishAD = data['noPublishAD'] ? 1 : '';
            for(let key in data){
                if(key == 'libKey' || key == 'equal' || key == 'orgKey' || key == 'begYear' || key == 'endYear' || key == 'noPublishAD'){

                }else{
                    keyWordObj[key] = data[key];
                }
            }
            this.keyWordObj = keyWordObj;
            this.getJiapuList();
        },
        changeParameters(data){
            let keyWordObj = {};
            this.libKey = data['libKey'];
            this.equal = data['equal'];
            this.orgKey = data['orgKey'];
            this.begYear = data['begYear'] || '';
            this.endYear = data['endYear'] || '';
            this.noPublishAD = data['noPublishAD'] ? 1 : '';
            for(let key in data){
                if(key == 'libKey' || key == 'equal' || key == 'orgKey' || key == 'begYear' || key == 'endYear' || key == 'noPublishAD'){

                }else{
                    keyWordObj[key] = data[key];
                }
            }
            this.keyWordObj = keyWordObj;
        },
        openRootModal(){// 分页公开
            if(this.role < 1 || this.role > 4){
                this.$message({message: '暂无权限操作',type: 'warning'});
                return false;
            }
            if(this.checkList && this.checkList.length && this.stationKey){
                this.isRootShow = true 
            }else{
                this.$message({message: '请勾选家谱',type: 'warning'});
            }
        },
        async getJiapuAllList(){// 全部谱目列表
            this.loading = true;
            let data=await api.getAxios('catalog/back?siteKey='+this.stationKey+'&noPublishAD='+this.noPublishAD+'&begYear='+this.begYear+'&endYear='+this.endYear+'&libKey='+this.libKey+'&orgKey='+this.orgKey+'&equal='+this.equal+'&keyWordObj='+JSON.stringify(this.keyWordObj)+'&prop='+this.prop+'&order='+this.order+'&page=0&limit=3000');
            this.loading = false;
            if(data.status == 200){
                this.checkList = data.result.list;
                this.checkList.map((item)=>{
                    item.select = true;
                });

                if(this.checkList && this.checkList.length && this.stationKey){
                    this.isSitePerspective = true; 
                }else{
                    this.$message({message: '没有检索到家谱',type: 'warning'});
                }
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        openSiteModal(flag = false){// 家谱分发
            if(flag){
                if(this.keyWordObj.surname || this.keyWordObj.place || this.keyWordObj.batchKey){
                    this.getJiapuAllList();
                }else{
                    this.$message({message: '请输入姓氏或谱籍地或批次',type: 'warning'});
                }
            }else{
                if(this.checkList && this.checkList.length && this.stationKey){
                    this.isSitePerspective = true; 
                }else{
                    this.$message({message: '请勾选家谱',type: 'warning'});
                }
            }
        },
        openSwapModal(){// 交换家谱
            if(this.role < 1 || this.role > 2){
                this.$message({message: '暂无权限',type: 'warning'});
                return false;
            }
            if(this.checkList && this.checkList.length && this.stationKey){
                this.isSwapModal = true 
            }else{
                this.$message({message: '请勾选家谱',type: 'warning'});
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            bindTotal: state => state.nav.bindTotal,
            bindPage: state => state.nav.bindPage,
        })
    },
    watch:{
        'fieldFilters':function(newV,oldV){
            this.getJiapuList();
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
    }
}
.btn_wrap_left{
    width: calc(100% - 40px);
    margin: 20px;
    display: flex;
    align-items: center;
    input{
        width: 140px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: #fff;
        border: none;
        outline: none;
        border-radius: 20px;
        cursor: pointer;
        margin-right: 20px;
        &.root{
            background:#fff url('../../assets/icon/root.svg') 35px 50% no-repeat;
            background-size: 16px;
            text-indent: 20px;
        }
        &.root:hover{
            background-image: url('../../assets/icon/rootActive.svg');
            color: #4C95FF;
        }
        &.swap{
            background:#fff url('../../assets/icon/swap.svg') 35px 50% no-repeat;
            background-size: 16px;
            text-indent: 20px;
        }
        &.swap:hover{
            background-image: url('../../assets/icon/swapActive.svg');
            color: #4C95FF;
        }
    }
}
.marginLeft20{
    margin-left: 20px;
}
</style>

