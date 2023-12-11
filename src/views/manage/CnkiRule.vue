<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'查重规则库'">
                <div class="toolbar">
                    <vxe-button v-if="role >= 1 && role <= 2" icon="fa fa-plus" content="新增" @click="insertEvent(-1)"></vxe-button>
                    <vxe-button icon="fa fa-save" content="刷新" @click="refresh"></vxe-button>
                </div>
            </NavModal>
            <div class="select-wrap">
                <span class="label">数据类型</span>
                <vxe-select v-model="type" placeholder="按数据类型查询">
                    <vxe-option v-for="(item,index) in dataType" :key="'type'+index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
            </div>
            <div class="vex-table-box">
                <vxe-table
                    border
                    resizable
                    stripe
                    keep-source
                    show-overflow
                    highlight-hover-row
                    row-key
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData"
                    :edit-config="{trigger: 'click', mode: 'row',showStatus: true,activeMethod:activeCellMethod}"
                    @edit-closed="editClosedEvent">
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column field="fields" title="查重字段" :edit-render="{name: '$select', options: fieldData, props:{'multiple':true, 'clearable':true}}"></vxe-table-column>
                    <vxe-table-column field="memo" title="含义" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="repeatPercent" title="重复概率" :edit-render="{name: '$input', props:{type: 'integer','min':0,'max':100,'clearable':true}}"></vxe-table-column>
                    <vxe-table-column field="createUser" title="创建人"></vxe-table-column>
                    <vxe-table-column field="createTime" title="创建时间"></vxe-table-column>
                    <vxe-table-column v-if="role >= 1 && role <= 2" title="操作" width="80" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'删除','value':'remove'}]},events:{'remove':removeSigleEvent}}"></vxe-table-column>
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
    name: "cnkirule",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            type:'',
            tableData: [],
            dataType:[],
            fieldData:[],
            h:300,
        };
    },
    created:function(){
        this.h = window.innerHeight - 134;
    },
    mounted:function(){
        this.getDataType();
    },
    methods:{
        activeCellMethod({row,column}){//控制编辑
            if(this.role < 1 || this.role > 2){
                return false;
            }
            return true;
        },
        refresh(){
            this.getRule();
        },
        async insertEvent(row){
            let record = {
                'createUser': this.userName,
            }
            let { row: newRow } = await this.$refs.xTable.insertAt(record, row)
            await this.$refs.xTable.setActiveCell(newRow, 'type')
        },
        editClosedEvent({ row, column }){
            let text = '';
            let field = column.property;
            let cellValue = row[field];
            if(field === 'fields'){
                cellValue.forEach((ele) => {
                    this.fieldData.forEach((ele2) => {
                        if(ele === ele2.value){
                            text = (text ? text+' ' : '') + ele2.fieldMeans;
                        }
                    })
                });
                row.memo = text;
            }

            this.addRule(row);
        },
        removeSigleEvent({row}){
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeField(row);
            }).catch(() => {});
        },
        removeEvent(){
            let selectRecords = this.$refs.xTable.getCheckboxRecords();
            if(!selectRecords.length){this.$XModal.message({ message: '请勾选列表', status: 'warning' });return;}
            console.log(selectRecords);
            this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.removeField(selectRecords[0]);
            }).catch(() => {});
        },
        async getDataType(){
            let data = await api.getAxios('dataType');
            if(data.status == 200){
                let dataType = [];
                data.data.map((item)=>{dataType.push({'label':item.showName,'value':item.type})});
                this.type = dataType[0].value;
                this.dataType = dataType;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getField(){
            let data = await api.getAxios('field?type='+this.type);
            if(data.status == 200){
                let fieldData = [];
                data.data.map((item)=>{
                    fieldData.push({'label':item.fieldName+'('+item.fieldMeans+')','value':item.fieldName, 'fieldMeans': item.fieldMeans});
                })
                this.fieldData = fieldData;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getRule(){
            let data = await api.getAxios('rule?type='+this.type+"&siteKey="+this.stationKey);
            if(data.status == 200){
                data.data.map((item)=>{
                    item.createTime = ADS.getLocalTime(item.createTime);
                })
                this.tableData = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async addRule(row){
            let data = await api.postAxios('rule',{ruleKey:row._key,siteKey: this.stationKey, type:this.type, fields:row.fields,memo:row.memo,repeatPercent:Number(row.repeatPercent),userKey:this.userId});
            if(data.status == 200){
                this.getRule();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async removeField(row){
            let data = await api.deleteAxios('rule',{ruleKey:row._key});
            if(data.status == 200){
                this.getRule();
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
        'type':function(newV,oldV){
            console.log(newV);
            this.getField();
            this.getRule();
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
        .select-wrap{
            padding: 10px 20px;
            width: calc(100% - 40px);
            .label{
                margin-right: 20px;
            }
        }
        .vex-table-box{
            width: calc(100% - 40px);
            height: calc(100% - 120px);
            margin: 0 auto;
        }
    }
}
.toolbar{
    display: flex;
    align-items: center;
}
</style>

