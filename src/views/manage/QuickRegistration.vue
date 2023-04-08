<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <div class="head-wrap">
                <div class="head-left">
                    <h3>一键注册</h3>
                </div>
                <div class="head-right">
                    <el-button v-if="(role >= 1 && role <= 2) || orgAdmin == 'admin'" class="marginLeft20" size="small" type="primary" @click="handleQuickRegister">一键注册</el-button>
                </div>
            </div>
            <div class="search-wrap">

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
                    <vxe-table-column field="mobile" title="账号"></vxe-table-column>
                    <vxe-table-column field="roles" title="微站权限"></vxe-table-column>
                    <vxe-table-column field="orgName" title="所属机构"></vxe-table-column>
                    <vxe-table-column field="rootStrO" title="功能权限"></vxe-table-column>
                </vxe-table>
            </div>
        </div>
        <QuickRegister v-if="isShow == 1" :detail="detail" v-on:close="isShow = 0" v-on:save="handleSave" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import QuickRegister from '../../components/quickRegister/QuickRegister.vue';
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "userManage",
    components: {
        Sidebar, QuickRegister, 
    },
    data: () => {
        return {
            h: 0,
            tableData: [],
            page: 1,
            pages: 0,
            total: 0,
            limit: 100,
            isShow: 0,
            detail: {},
        };
    },
    created:function(){
        this.h = window.innerHeight - 100;
    },
    mounted:function(){
        
    },
    methods:{
        handleQuickRegister(){
            this.isShow = 1;
        },
        handleSave(data){
            this.isShow = 0;
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
        height: 100%;
        background: #EFF1F5;
        .head-wrap{
            position: relative;
            padding: 0 20px;
            width: calc(100% - 40px);
            height: 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .search-wrap{
            position: relative;
            padding: 0 20px;
            width: calc(100% - 40px);
            height: 40px;
            display: flex;
            align-items: center;
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 80px);
        }
    }
}
.width100{
    width: 150px !important;
}
.marginLeft20{
    margin-left: 20px;
}
</style>

