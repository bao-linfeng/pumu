<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'DOR关联详情(<a href=https://cdn-icare.qingtime.cn/'+name+' target=_blank>'+(name.substr(name.indexOf('_')+1))+'</a>)('+(statusO[dorStatus] || '待提交')+')'">
                <div class="tool-bar">
                    <vxe-button status="primary" content="批量打标" v-if="role >= 1 && role <= 2 && tableData.length && dorStatus == 1" @click="dorOKArr"></vxe-button>
                    <vxe-button status="primary" content="打回" v-if="role >= 1 && role <= 2 && tableData.length && dorStatus == 1" @click="auditing(0)"></vxe-button>
                    <vxe-button status="primary" content="审核通过" v-if="role >= 1 && role <= 2 && tableData.length && dorStatus == 1" @click="auditing(2)"></vxe-button>
                    <vxe-button status="primary" content="返回" @click="goBack"></vxe-button>
                </div>
            </NavModal>
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
                :edit-config="{trigger: 'click', mode: 'row',showStatus: true,activeMethod:activeCellMethod}"
                @edit-closed="editClosedEvent"
                :data="tableData">
                <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                <vxe-table-column field="batch" title="批次号"></vxe-table-column>
                <vxe-table-column field="_key" title="编码"></vxe-table-column>
                <vxe-table-column field="genealogyName" title="谱名" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column field="publish" title="出版年" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column field="volume" title="卷数" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column field="hall" title="堂号" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column field="authors" title="作者" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column field="surname" title="姓氏" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column field="place" title="谱籍地" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column field="hasVolume" title="实拍册数" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column field="hasVolume" title="缺卷" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column field="hasVolume" title="谱籍现代地名" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column field="creator" title="上传者"></vxe-table-column>
                <!-- <vxe-table-column title="影像" :cell-render="{name:'AdaiActionButton',attr:{data:actionData},events:{'look':navTo}}"></vxe-table-column> -->
                <vxe-table-column v-if="dorStatus == 2" field="dorOKMsg" title="打标"></vxe-table-column>
                <vxe-table-column v-if="role >= 1 && role <= 2 && dorStatus == 1" field="dorOK" title="打标操作" width="80" :cell-render="{name:'AdaiSwitchButton',attr:{property:'dorOK'},events:{'click':dorOKSingle}}"></vxe-table-column>
            </vxe-table>
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
    name: "dorManage",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            tableData: [],
            page: 1,
            pages: 1,
            limit: 20,
            total: 0,
            dorKey: '',
            name: '',
            actionData: [{'label':'查看','value':'look'}],
            dataArr: [],
            statusO: {
                0: '已打回',
                1: '提交审核',
                2: '审核成功'
            },
            dorStatus: '',
        };
    },
    created:function(){
        let search = window.location.search,param=ADS.params(search);
        this.dorKey = param['dorKey'] || '';
        this.name = param['name'] ? decodeURIComponent(param['name']) : '';
        this.h = window.innerHeight - 80;
    },
    mounted:function(){
        this.getJiapuList();
    },
    methods:{
        activeCellMethod({row,column}){//控制编辑
            if(this.role < 1 || this.role > 2){
                return false;
            }
            return true;
        },
        editClosedEvent({row}){
            this.editCatalog(row);
        },
        editCatalog:async function(row){// 编辑谱目
            let dataObj = {};
            ['surname','place','genealogyName','authors','hall'].map((item)=>{
                dataObj[item] = row[item];
            });
            let data=await api.patchAxios('data/edit',{'dataKey':row._key,'dataObj':dataObj});
            if(data.status == 200){
                
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        auditing:async function(status){// 审核状态
            if(status == 2){
                let doroks = [];
                this.tableData.map((item)=>{
                    if(item.dorOK){
                        doroks.push(item._key);
                    }
                });
                if(!doroks.length){
                    this.$XModal.message({message: '没有打标，不允许审核通过', status: 'warning'})
                    return false;
                }
            }
            let data = await api.patchAxios('dor/status',{'dorKey': this.dorKey, 'status': status});
            if(data.status == 200){
                this.dorStatus = status;
            }else{
                this.$XModal.message({message: data.msg, status: 'warning'})
            }
        },
        navTo({row}){
            row.hasImage == 1 ? this.$router.push('/'+window.localStorage.getItem('pathname')+'/view?gid='+row._key+'&volume=1&page=1') : this.$XModal.message({ message: '暂无影像', status: 'warning' });
        },
        goBack(){
            this.$router.push('/'+window.localStorage.getItem('pathname')+'/dor');
        },
        checkboxChange({records}){// 批量
            let dataArr = [];
            records.map((item)=>{
                dataArr.push(item._key);
            });
            this.dataArr = dataArr;
        },
        dorOKArr(){
            if(this.dataArr.length){
                this.dataDOROK(this.dataArr);
            }else{
                this.$XModal.message({ message: '请勾选家谱', status: 'warning' });
            }
        },
        dorOKSingle({row}){
            this.dataDOROK([row._key]);
        },
        dataDOROK:async function(dataArr){// 打标接口
            let data=await api.patchAxios('data/dorOK',{'dorKey':this.dorKey,'batch': '','dataArr': dataArr});
            if(data.status == 200){
                this.tableData.map((item)=>{
                    if(dataArr.indexOf(item._key) > -1){
                        item.dorOK = item.dorOK == 1 ? 0 : 1;
                    }
                    if(item.dorOK == 1){
                        item.dorOKMsg = '√';
                    }
                })
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        getJiapuList:async function(){// DOR关联家谱
            let data=await api.getAxios('data/byDor?dorKey='+this.dorKey+'&page='+this.page+'&limit='+this.limit);
            if(data.status == 200){
                this.dorStatus = data.dorStatus;
                this.tableData = data.data || [];
                this.tableData.map((item)=>{
                    if(item.dorOK == 1){
                        item.dorOKMsg = '√';
                    }
                })
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
    }
}
</style>

