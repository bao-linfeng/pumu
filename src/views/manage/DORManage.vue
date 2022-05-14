<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'DOR报告列表'">
                <div class="tool-bar">
                    <UploadDOR v-if="role >= 1 && role <= 4" v-on:get-dor="getDORList" />
                    <vxe-button v-if="role >= 1 && role <= 2 && tableData.length" status="primary" content="删除" @click="removeDORReports"></vxe-button>
                </div>
            </NavModal>
            <div class="select-wrap">
                <vxe-select v-if="role >= 1 && role <= 2" v-model="userKey" placeholder="上传者">
                    <vxe-option v-for="(item,index) in userList" :key="'site'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-input v-model="startTime" type="date" placeholder="请选择开始日期" clearable></vxe-input>
                <vxe-input v-model="endTime" type="date" placeholder="请选择结束日期" clearable></vxe-input>
                <vxe-button status="primary" content="检索" @click="getDORList"></vxe-button>
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
                    @checkbox-change = "checkboxChange"
                    @checkbox-all = "checkboxChange"
                    :data="tableData">
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column field="fileName" title="dor文件名" width="400"></vxe-table-column>
                    <vxe-table-column field="time" title="上传日期"></vxe-table-column>
                    <vxe-table-column field="userName" title="上传人"></vxe-table-column>
                    <vxe-table-column field="dataNum" title="关联谱目"></vxe-table-column>
                    <vxe-table-column field="dataNo" title="未打标"></vxe-table-column>
                    <vxe-table-column field="dataOK" title="已打标"></vxe-table-column>
                    <vxe-table-column field="statusO" title="状态"></vxe-table-column>
                    <vxe-table-column title="操作" :width="w" :cell-render="{name:'AdaiActionButton',attr:{data:actionData},events:{'look':navTo,'link': linkJiapu, 'auditing':auditing}}"></vxe-table-column>
                </vxe-table>
            </div>
        </div>
        <DORLinkModal v-if="isDORLinkModal" :name="name" :dorKey="dorKey" v-on:close-link="closeLink" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import NavModal from "../../components/dictionary/NavModal.vue";
import UploadDOR from "../../components/DOR/UploadDOR.vue";
import DORLinkModal from "../../components/DOR/DORLinkModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "dorManage",
    components: {
        Sidebar,NavModal,UploadDOR,DORLinkModal,
    },
    data: () => {
        return {
            tableData: [],
            actionData: [{'label':'查看', 'value':'look'},{'label':'关联', 'value':'link'},{'label':'提交审核', 'value':'auditing'}],
            page: 1,
            pages: 1,
            limit: 20,
            total: 0,
            userList: [],
            userKey: '',
            startTime: '',
            endTime: '',
            isDORLinkModal: false,
            name: '',
            dorKey: '',
            w: 220,
            statusO: {
                0: '已打回',
                1: '提交审核',
                2: '审核成功'
            },
            dorKeys:[],
        };
    },
    created:function(){
        this.h = window.innerHeight - 132;
    },
    mounted:function(){
        if(this.role >= 1 && this.role <= 2){
            this.getUserList();
        }
        this.getDORList();
    },
    methods:{
        getUserList:async function(){// 上传者
            let data = await api.getAxios('site/dataUser?siteKey='+this.stationKey);
            if(data.status == 200){
                let userList = [{'label':'全部','value':''}];
                data.result.map((item)=>{
                    userList.push({'label':item.userName,'value':item._key});
                });
                this.userList = userList;
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'});
            }
        },
        auditing:async function({row}){// 审核状态
            if(row.status){
                this.$XModal.message({message: '已'+this.statusO[row.status]+'，不允许提交审核', status: 'warning'});
                return false;
            }
            if(!row.dataNum){
                this.$XModal.message({message: '没有关联家谱，不允许提交审核', status: 'warning'});
                return false;
            }
            let data = await api.patchAxios('dor/status',{'dorKey': row._key, 'status': 1});
            if(data.status == 200){
                this.tableData.map((item)=>{
                    if(item._key == row._key){
                        item.status = 1;
                        item.statusO = this.statusO[item.status];
                    }
                });
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
        closeLink(data){
            if(data){
                this.getDORList();
            }
            this.isDORLinkModal = false;
        },
        linkJiapu({row}){
            if(row.userKey != this.userId){
                this.$XModal.message({message: '您无权限操作', status: 'warning'});
                return false;
            }
            if(row.status){
                this.$XModal.message({message: '已'+this.statusO[row.status]+'，暂时无法关联家谱', status: 'warning'});
                return false;
            }
            this.name = row.name;
            this.dorKey = row._key
            this.isDORLinkModal = true;
        },
        navTo({row}){
            if(!row.dataNum){
                this.$XModal.message({message: '暂无关联家谱,无法查看', status: 'warning'});
                return false;
            }
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/dor/detail?dorKey='+row._key+'&name='+row.name);
        },
        checkboxChange({records}){// 批量选中
            let dorKeys = [];
            records.map((item)=>{
                dorKeys.push(item._key);
            });
            this.dorKeys = dorKeys;
        },
        removeDORReports(){
            this.$confirm('此操作将永久删除选中dor报告, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeDORReport(this.dorKeys);
            }).catch(() => {});
        },
        removeDORReport:async function(dorKeys){// 删除dor报告
            if(!dorKeys.length){
                this.$XModal.message({message: '请勾选列表', status: 'warning'});
                return false;
            }
            let data = await api.deleteAxios('dor',{'dorArr': dorKeys});
            if(data.status == 200){
                this.getDORList();
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
        getSite:async function(){// 微站
            let data = await api.getAxios('site/all?keyWord=');
            if(data.status == 200){
                let site = [{'label':'全部机构','value':''}];
                data.data.map((item) => {site.push({'label':item.siteName,'value':item._key})});
                this.site = site;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getDORList:async function(){// DOR列表
            let data = await api.getAxios('data/dor?siteKey='+this.stationKey+'&userKey='+this.userId+'&creator='+this.userKey+'&userRole='+this.role+'&startTime='+ADS.Date2Timestamp(this.startTime)+"&endTime="+ADS.Date2Timestamp(this.endTime)+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                data.data.map((item)=>{
                    item.fileName = item.name.substr(item.name.indexOf('_') + 1);
                    item.time = ADS.getLocalTime(item.time);
                    item.statusO = this.statusO[item.status];
                })
                this.tableData = data.data;
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
    },
    computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
        })
    },
    watch:{
        
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
        .tool-bar{
            display: flex;
            align-items: center;
        }
        .select-wrap{
            padding: 10px 20px;
            width: calc(100% - 40px);
            display: flex;
            align-items: center;
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 140px);
        }
    }
}
</style>

