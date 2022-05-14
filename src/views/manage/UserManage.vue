<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'用户管理'">
                <div class="tool-bar">
                    <vxe-checkbox v-if="stationKey == '1379194999' && role >= 1 && role <= 2" v-model="canSee" content="时光家谱"></vxe-checkbox>
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
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData">
                    <vxe-table-column field="userName" title="姓名"></vxe-table-column>
                    <vxe-table-column field="roles" title="权限"></vxe-table-column>
                    <vxe-table-column field="batchNum" title="上传批次"></vxe-table-column>
                    <vxe-table-column field="catalogNum" title="上传谱目"></vxe-table-column>
                    <vxe-table-column field="passNum" title="录用的谱目"></vxe-table-column>
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
    name: "userManage",
    components: {
        Sidebar,NavModal,
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
        };
    },
    created:function(){
        this.h = window.innerHeight - 100;
    },
    mounted:function(){
        if(this.stationKey == '1379194999' && this.role >= 1 && this.role <= 2){
            this.getSiteSeeSG();
        }
        this.getSiteUser();
    },
    methods:{
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
            let data=await api.getAxios('site/user?siteKey='+this.stationKey+'&userKey='+this.userId+'&userRole='+this.role);
            if(data.status == 200){
                let result = data.result;
                result.map((item)=>{
                    item.roles = this.roleO[item.role];
                });
                this.tableData = result;
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
        .tool-bar{
            display: flex;
            align-items: center;
        }
        .vex-table-box{
            width: calc(100% - 40px);
            padding: 0 20px;
            height: calc(100% - 80px);
            margin-top: 20px;
        }
    }
}
</style>

