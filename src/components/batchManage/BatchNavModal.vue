<template>  
    <NavModal :title="fileName+' 工作台 '+(l ? '(总条数'+l : '')+(repeatNum ? '-重复数据'+repeatNum+'条)' : ')')">
        <div class="toolbar">
            <el-checkbox v-if="active == 3 && needReview" v-model="Tobediscussed">待议谱</el-checkbox>
            <!-- <vxe-button content="批量删除" @click="setUnRepeatInBatchConfirm"></vxe-button> -->
            <vxe-button v-if="hasRoot" content="批量审核通过" @click="dataVertify"></vxe-button>
            <i class="el-icon-setting refresh marginR10" title="管理" @click="changeIsManage"></i>
            <vxe-select v-if="active == 3" v-model="caozheng" placeholder="计划入库" :style="{'width':'120px','margin-right':'10px'}">
                <vxe-option v-for="(item,index) in caozhengs" :key="'hasIn'+index" :value="item.value" :label="item.label"></vxe-option>
            </vxe-select>
            <vxe-select v-model="examine" placeholder="审核状态" :style="{'width':'120px','margin-right':'10px'}">
                <vxe-option v-for="(item,index) in examines" :key="'type'+index" :value="item.value" :label="item.label"></vxe-option>
            </vxe-select>
            <!-- <vxe-button content="补充资料" v-if="role >= 1 && role <= 3 && active == 4" @click="dataVertify"></vxe-button> -->
            <vxe-button content="批量计划入库" v-if="isPiL" @click="suggInBatch"></vxe-button>
            <i class="el-icon-delete refresh" title="删除批次" @click="removeBatchAll"></i>
            <!-- <i class="el-icon-refresh refresh" title="刷新" @click="getDataCheckLog"></i>
            <i class="el-icon-arrow-left refresh" title="返回上一级" @click="navTo"></i> -->
        </div>
    </NavModal>
</template>

<script>
import NavModal from "../../components/dictionary/NavModal.vue";
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "BatchNavModal",
    components: {
        NavModal,
    },
    props:{
        batchId:{
            type: String
        },
        l:{
            type: Number
        },
        active:{
            type: Number
        },
        needReview: {
            type: Number
        },
        caozhengs:{
            type: Array
        },
        examines:{
            type: Array
        },
        isPiL:{
            type: Boolean
        },
        repeatNum: {
            type: Number
        },
        selectRecords: {
            type: Array
        }
    },
    data: () => {
        return {
            caozheng: '',
            examine: '',
            fileName: '',
            hasRoot: '',
            Tobediscussed: true,
        };
    },
    mounted:function(){
        let search = window.location.search, param = ADS.params(search);
        this.fileName = param['f'] ? decodeURIComponent(param['f']) : '';
        this.hasRoot = ADS.getQueryVariable('hasRoot');
    },
    methods:{
        changeLoading(flag = true){
            this.$store.dispatch('setPropertyValue',{'property':'loading','value': flag});
        },
        changeIsManage(){
            this.$emit('change-is-manage',true);
        },
        dataVertify(){
            this.$emit('data-vertify','return');
        },
        setUnRepeatInBatchConfirm(){
            console.log(this.selectRecords);
            if(!this.selectRecords.length){
                return this.$XModal.message({ message: '请勾选家谱', status: 'warning' });
            }
            this.$confirm('此操作将永久清除该批数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteCatalogApi();
                // this.setUnRepeatInBatch();
            }).catch(() => {});
        },
        deleteCatalogApi:async function(row){
            let dataKeyArr = [];
            this.selectRecords.map((item) => {
                dataKeyArr.push(item._key);
            });
            this.changeLoading();
            let data=await api.deleteAxios('cleanRepeatInBatch',{'dataKeyArr': dataKeyArr});
            this.changeLoading(false);
            if(data.status == 200){
                // this.$emit('set-unrepeat', dataKeyArr);
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        setUnRepeatInBatch: async function(){//批量清除家谱自查重标记
            let dataKeyArr = [];
            this.selectRecords.map((item) => {
                dataKeyArr.push(item._key);
            });
            this.changeLoading();
            let data=await api.postAxios('setUnRepeatInBatch',{'dataKeyArr': dataKeyArr});
            this.changeLoading(false);
            if(data.status == 200){
                this.$emit('set-unrepeat', dataKeyArr);
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        removeBatchAll(){//删除批次所有数据确认函数
            this.$confirm('此操作将永久删除该批次所有数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeBatchData();
            }).catch(() => {});
        },
        removeBatchData:async function(){// 删除该批次所有数据
            let data=await api.deleteAxios('batch',{'batchKey':this.batchId,'userRole':this.role,'userKey':this.userId, 'siteKey': this.stationKey, 'orgKey': this.orgId});
            if(data.status == 200){
                this.$notify({
                    title: '提示',
                    message: this.userName+'删除了'+this.batchId+'批次数据',
                    duration: 0,
                    type: 'success'
                });
                this.$router.push('/'+window.localStorage.getItem('pathname')+'/batchmanage');
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getDataCheckLog(){
            this.$emit('get-jiapu','');
        },
        navTo(){
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/batchmanage');
        },
        suggInBatch:async function(){// 批次计划入库
            this.changeLoading();
            let data=await api.patchAxios('data/willIn/batch',{'batchKey':this.batchId});
            this.changeLoading(false);
            if(data.status == 200){
                this.getDataCheckLog();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            orgId: state => state.nav.orgId
        })
    },
    watch:{
        'Tobediscussed': function(nv, ov){
            this.$emit('change-Tobediscussed', nv);
        },
        'caozheng':function(newV,oldV){
            this.$emit('change-value',{'label':'caozheng','value':newV});
            this.getDataCheckLog();
        },
        'examine':function(newV,oldV){
            this.$emit('change-value',{'label':'examine','value':newV});
            this.getDataCheckLog();
        },
    }
};
</script>
<style scoped lang="scss">
.toolbar{
    display: flex;
    align-items: center;
    .refresh{
        font-size: 20px;
        margin-left: 10px;
        cursor: pointer;
        color: #358acd;
    }
}
.title{
    margin: 20px 0;
    text-indent: 20px;
}
.marginR10{
    margin-right: 10px;
}
</style>

