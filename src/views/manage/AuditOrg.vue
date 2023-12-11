<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'成员申请审核'"></NavModal>
            <div class="select-wrap">
                <input class="name" type="text" v-model="searchCondition" @keyup.enter="applyJoinOrgList" placeholder="请输入申请人" />
                <vxe-select v-if="role >= 1 && role <= 2" v-model="orgKey" placeholder="机构">
                    <vxe-option v-for="(item,index) in orgList" :key="index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
                <vxe-button status="primary" content="检索" @click="applyJoinOrgList"></vxe-button>
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
                    <vxe-table-column field="orgName" title="机构名称"></vxe-table-column>
                    <vxe-table-column field="userName" title="申请人"></vxe-table-column>
                    <vxe-table-column field="createTimeO" title="申请时间"></vxe-table-column>
                    <vxe-table-column title="操作" :cell-render="{name:'AdaiActionButton',attr:{data:actionData},events:{'look':addUser, 'reject': handleReject}}"></vxe-table-column>
                </vxe-table>
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
    name: "auditOrg",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            tableData: [],
            actionData: [{'label':'通过', 'value':'look'}, {'label':'拒绝', 'value':'reject'}],
            page: 1,
            pages: 1,
            limit: 50,
            total: 0,
            searchCondition: '',
            h: 0,
            orgKey: '',
            orgList: [],
        };
    },
    created:function(){
        this.h = window.innerHeight - 132;
    },
    mounted:function(){
        if(this.role >= 1 && this.role <= 2){

        }else{
            this.orgKey = this.orgId;
        }
        this.getOrgList();
        this.applyJoinOrgList();
    },
    methods:{
        async getOrgList(){
            let result = await api.getAxios('org?orgKey=&name=&siteKey='+this.stationKey);
            if(result.status == 200){
                this.orgList = result.data.map((ele) => {
                    ele.label = ele.name;
                    ele.value = ele._key;
                    return ele;
                });
                this.orgList.unshift({'label': '全部', 'value': ''});
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        addUser({row}){
            this.addOrgUser(row.orgKey, row.userKey);
        },
        async applyJoinOrgList(){
            let data = await api.getAxios('org/applyJoinOrgList?siteKey='+this.stationKey+'&userKey='+this.userId+'&orgKey='+this.orgKey+'&searchCondition='+this.searchCondition+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.tableData = data.data.list.map((ele) => {
                    ele.status = '';
                    ele.createTimeO = ele.createTime ? ADS.getLocalTime(ele.createTime) : '';
                    return ele;
                });
                this.pages = data.data.pageNum;
                this.total = data.data.total;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async addOrgUser(orgKey, userKey){// 添加机构成员
            let data = await api.postAxios('org/member',{'orgKey': orgKey, 'userKey': userKey});
            if(data.status == 200){
                this.applyJoinOrgList();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async handleReject({row}){// 拒绝申请
            let data = await api.deleteAxios('applyJoinOrg',{'siteKey': this.stationKey, 'userKey': this.userId, 'applyJoinOrgKey': row._key});
            if(data.status == 200){
                this.applyJoinOrgList();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
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
            orgAdmin: state => state.nav.orgAdmin,
            orgId: state => state.nav.orgId,
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
            .name{
                border: 1px solid #ddd;
                border-radius: 5px;
                width: 300px;
                height: 34px;
                line-height: 34px;
                text-indent: 10px;
                outline: none;
            }
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 140px);
        }
    }
}
</style>

