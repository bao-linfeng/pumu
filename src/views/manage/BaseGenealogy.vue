<template>  
    <div class="wrap">
        <!-- 侧边栏 -->
        <Sidebar />
        <div class="content">
            <!-- 导航 -->
            <NavModal title="本站家谱" />
            <!-- 检索模块 -->
            <SearchModal v-show="!isFull" :fieldFilters="fieldFilters" v-on:get-genealogy="getGenealogy" v-on:change-parameters="changeParameters" />
            <div v-show="!isFull" class="btn_wrap_left">
                <input v-if="this.role >=1 && this.role <= 2" class="root" type="button" value="前台公开" @click="openRootModal" />
                <input v-if="stationKey == '1379194999'" class="swap" type="button" value="家谱分发" @click="openSiteModal(false)" />
                <input v-if="stationKey == '1379194999'" class="swap" type="button" value="全部分发" @click="openSiteModal(true)" />
                <input v-else v-show="stationKey != '1528234980'" class="swap" type="button" value="交换家谱" @click="openSwapModal" />
                <el-button size="small" type="primary" v-if="this.role >=1 && this.role <= 2" @click="downloadExcel">下载检索结果</el-button>
                <LinkView class="marginLeft20" />
                <!-- v-show="stationKey != '1528234980'" -->
                <el-button v-if="this.role >=1 && this.role <= 2"  class="marginLeft20" size="small" type="primary" @click="isEdit = true">编辑的家谱</el-button>
            </div>
            <!-- 家谱table -->
            <GenealogyTableModal v-if="fieldFilters.length" :fieldFilters="fieldFilters" :total="total" :list="list" v-on:toggle-full="toggleFull" v-on:checkbox-change="checkboxChange" v-on:get-genealogy="getJiapuList" />
            <vxe-pager
                align="center"
                @page-change = "changePage"
                :current-page.sync="page"
                :page-size.sync="limit"
                :total="total"
                :layouts="['PrevJump', 'PrevPage', 'JumpNumber','NextPage', 'NextJump', 'FullJump', 'Total']">
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
            startTime: '',
            endTime: '',
            fileName: '',
            keyWord: '',
            isPublish: '',
            isPlace: '',
            condition: '',
            FileStartTimes: '',
            FileEndTimes: '',
            isFull: false,
            gcStatus: '',
            NoIndex: '',
            targetSiteKey: '',
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
        toggleFull(data){
            this.isFull = data;
        },
        reconnect(){
            this.$socket.emit("login",{'userKey':this.userId,'siteKey':this.stationKey, 'role': this.role});
        },
        async getOrgInfo(){
            let data = await api.getAxios('org/member/info?siteKey='+this.stationKey+'&userKey='+this.userId);
            if(data.status == 200){
                this.$store.dispatch('setPropertyValue',{'property':'orgAdmin','value': data.data.role || ''});
                window.localStorage.setItem('orgAdmin',data.data.role || '');
                this.$store.dispatch('setPropertyValue',{'property':'orgId','value': data.data.orgKey || ''});
                window.localStorage.setItem('orgId',data.data.orgKey || '');
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
        async downloadExcel(){// 下载检索结果
            this.loading = true;
            let data = await api.postAxios('data/download',{
                'siteKey': this.stationKey,
                'userKey': this.userId,
                'startFileTimes': (this.FileStartTimes ? new Date(this.FileStartTimes).getTime() : ''),
                'endFileTimes': (this.FileEndTimes ? new Date(this.FileEndTimes).getTime() : ''),
                'condition': this.condition.join(','),
                'isPublish': this.isPublish,
                'isPlace': this.isPlace,
                'noPublishAD': this.noPublishAD,
                'NoIndex': this.noPublishAD,
                'fileName': this.fileName,
                'keyWord': this.keyWord,
                'startTime': this.startTime,
                'endTime': this.endTime,
                'begYear': this.begYear,
                'endYear': this.endYear,
                'libKey': this.libKey,
                'orgKey': (this.orgKey).join(','),
                'equal': this.equal,
                'gcStatus': this.gcStatus,
                'keyWordObj': this.keyWordObj,
                'prop': this.prop,
                'order': this.order,
                'targetSiteKey': this.targetSiteKey,
                'limit': 5000,
            });
            this.loading = false;
            if(data.status == 200){
                ADS.downliadLink(data.result);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getJiapuList(O){// 谱目列表
            console.log(O);
            if(O){
                this.prop = O.prop;
                this.order = O.order;
            }
            this.loading = true;
            let data = await api.getAxios('catalog/back?siteKey='+this.stationKey+
            '&startFileTimes='+(this.FileStartTimes ? new Date(this.FileStartTimes).getTime() : '')+
            '&endFileTimes='+(this.FileEndTimes ? new Date(this.FileEndTimes).getTime() : '')+
            '&condition='+this.condition+
            '&isPublish='+this.isPublish+
            '&isPlace='+this.isPlace+
            '&noPublishAD='+this.noPublishAD+
            '&NoIndex='+this.NoIndex+
            '&fileName='+this.fileName+
            '&keyWord='+this.keyWord+
            '&startTime='+this.startTime+
            '&endTime='+this.endTime+
            '&begYear='+this.begYear+
            '&endYear='+this.endYear+
            '&libKey='+this.libKey+
            '&orgKey='+this.orgKey+
            '&equal='+this.equal+
            '&gcStatus='+this.gcStatus+
            '&keyWordObj='+JSON.stringify(this.keyWordObj)+
            '&prop='+this.prop+
            '&targetSiteKey='+this.targetSiteKey+
            '&order='+this.order+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status == 200){
                this.list = data.result.list;
                this.list.map((item)=>{
                    item.GCOverO = item.GCOver == 1 ? '已完结' : '未完结';
                    item.gcStatusO = this.catalogStatusO[item.gcStatus] || '';
                    item.NoIndexO = item.NoIndex == 1 ? '不可索引' : '可索引';
                    item.claimTimeO = item.claimTime ? ADS.getLocalTime(item.claimTime, '/', 1) : '';
                    item.createTimeO = item.createTime ? ADS.getLocalTime(item.createTime, '/', 1) : '';
                    item.Filetimes = ADS.getLocalTime(item.createTime, '/', 1) || item.Filetimes;
                    item.Filenames = item.Filenames;
                    item.address = (item.prov || '') + ' ' + (item.city || '') + ' ' + (item.district || '');
                    item.hasImageO = item.hasImage == 1 ? '有' : '无';
                    item.libsStr = item.libs.join(',');
                    item.shareOrCopySiteNamesO = item.shareOrCopySiteNames.join(',');
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
            this.startTime = data['startTime'] || '';
            this.endTime = data['endTime'] || '';
            this.fileName = data['fileName'] || '';
            this.keyWord = data['keyWord'] || '';
            this.isPublish = data['isPublish'] ? 1 : '';
            this.NoIndex = data['NoIndex'];
            this.isPlace = data['isPlace'] ? 1 : '';
            this.condition = data['condition'] || '';
            this.FileStartTimes = data['FileStartTimes'] || '';
            this.FileEndTimes = data['FileEndTimes'] || '';
            this.gcStatus = data['gcStatus'] || '';
            this.targetSiteKey = data['targetSiteKey'] || '';

            for(let key in data){
                if(key == 'targetSiteKey' || key == 'gcStatus' || key == 'FileStartTimes' || key == 'FileEndTimes' || key == 'condition' || key == 'NoIndex' || key == 'isPublish' || key == 'isPlace' || key == 'fileName' || key == 'keyWord' || key == 'startTime' || key == 'endTime' || key == 'libKey' || key == 'equal' || key == 'orgKey' || key == 'begYear' || key == 'endYear' || key == 'noPublishAD'){

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
            this.NoIndex = data['NoIndex'];
            this.FileStartTimes = data['FileStartTimes'] || '';
            this.FileEndTimes = data['FileEndTimes'] || '';
            this.gcStatus = data['gcStatus'] || '';
            this.targetSiteKey = data['targetSiteKey'] || '';

            for(let key in data){
                if(key == 'targetSiteKey' || key == 'gcStatus' || key == 'FileStartTimes' || key == 'FileEndTimes' || key == 'NoIndex' || key == 'libKey' || key == 'equal' || key == 'orgKey' || key == 'begYear' || key == 'endYear' || key == 'noPublishAD'){

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
            let data=await api.getAxios('catalog/back?siteKey='+this.stationKey+'&startFileTimes=&endFileTimes='+'&condition='+this.condition+'&isPublish='+this.isPublish+'&isPlace='+this.isPlace+'&fileName='+this.fileName+'&keyWord='+this.keyWord+'&startTime='+this.startTime+'&endTime='+this.endTime+'&noPublishAD='+this.noPublishAD+'&begYear='+this.begYear+'&endYear='+this.endYear+'&libKey='+this.libKey+'&orgKey='+this.orgKey+'&equal='+this.equal+'&keyWordObj='+JSON.stringify(this.keyWordObj)+'&prop='+this.prop+'&order='+this.order+'&page=0&limit=3000');
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
            catalogStatusO: state => state.nav.catalogStatusO,
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
    margin: 5px 20px;
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

