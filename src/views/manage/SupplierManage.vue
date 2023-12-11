<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'供应商管理'"></NavModal>
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
                    <vxe-table-column v-if="stationKey == '1379194999'" field="siteName" title="供应商"></vxe-table-column>
                    <vxe-table-column field="totalNum" title="总笔数"></vxe-table-column>
                    <vxe-table-column field="inNum" title="需拍笔数"></vxe-table-column>
                    <vxe-table-column title="操作" width="140" :cell-render="{name:'AdaiActionButton',attr:{data:actionData},events:{'look':navTo}}"></vxe-table-column>
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
    name: "SupplierManage",
    components: {
        Sidebar,NavModal
    },
    data: () => {
        return {
            tableData: [],
            actionData: [{'label':'查看批次','value':'look'}],
            page: 1,
            pages: 1,
            limit: 20,
            total: 0,
            siteKey: '',
        };
    },
    created:function(){
        this.h = window.innerHeight - 100;
        this.stationKey == '1379194999' ? '' : this.siteKey = this.stationKey;
    },
    mounted:function(){
        this.getSupplierList();
    },
    methods:{
        navTo({row}){
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/batchmanage?siteKey='+row._key);
        },
        getSupplierList:async function(){// DOR列表
            let data=await api.getAxios('site/statistics?siteKey='+this.siteKey+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.tableData = data.data;
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
    },
    computed: {
        ...mapState({
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
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 20px 20px 0 20px;
            height: calc(100% - 100px);
        }
    }
}
</style>

