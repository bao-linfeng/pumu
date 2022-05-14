<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <NavModal :title="'数据字段定义'">
                <div class="toolbar">
                    <vxe-button v-if="role >= 1 && role <= 2 && stationKey == '1379194999'" icon="fa fa-plus" content="新增" @click="insertEvent(-1)"></vxe-button>
                    <vxe-button icon="fa fa-save" content="刷新" @click="refresh"></vxe-button>
                </div>
            </NavModal>
            <div class="select-wrap">
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
                    class="sortable-row-demo"
                    ref="xTable"
                    :height="h"
                    :align="'center'"
                    :data="tableData"
                    :edit-config="{trigger: 'click', mode: 'row',showStatus: true,activeMethod:activeCellMethod}"
                    @edit-closed="editClosedEvent">
                    <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                    <vxe-table-column field="type" title="类型" :edit-render="{name: '$select', options: dataType}"></vxe-table-column>
                    <vxe-table-column field="fieldName" title="英文字段名" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="fieldMeans" title="显示名" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="memo" title="备注" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="reserved" title="保留字段" width="70" :edit-render="{name: '$select', options: selectOption}"></vxe-table-column>
                    <vxe-table-column field="required" title="必填" width="70" :edit-render="{name: '$select', options: selectOption}"></vxe-table-column>
                    <vxe-table-column field="asSearch" title="检索" width="70" :edit-render="{name: '$select', options: selectOption}"></vxe-table-column>
                    <vxe-table-column field="needSort" title="排序" width="70" :edit-render="{name: '$select', options: selectOption}"></vxe-table-column>
                    <vxe-table-column field="takePhoto" title="拍机" width="70" :edit-render="{name: '$select', options: photoOption}"></vxe-table-column>
                    <vxe-table-column field="checkRequire" title="强制类型检查" :edit-render="{name: '$select', options: selectOption}"></vxe-table-column>
                    <vxe-table-column field="form" title="数据类型" :edit-render="{name: '$select', options: [{'label':'整数',value:'Int'},{'label':'字符串',value:'String'}]}"></vxe-table-column>
                    <vxe-table-column field="createUser" title="创建人"></vxe-table-column>
                    <vxe-table-column field="createTime" title="创建时间"></vxe-table-column>
                    <vxe-table-column field="updateUser" title="修改人"></vxe-table-column>
                    <vxe-table-column field="updateTime" title="更新时间"></vxe-table-column>
                    <vxe-table-column v-if="type" type="html" title="拖动" field="move" width="60"></vxe-table-column>
                    <vxe-table-column v-if="role >= 1 && role <= 2 && stationKey == '1379194999'" title="操作" width="75" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'删除','value':'remove'}]},events:{'remove':removeSigleEvent}}"></vxe-table-column>
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
    name: "datamenufield",
    components: {
        Sidebar,NavModal,
    },
    data: () => {
        return {
            showHelpTip1: false,
            type: '',
            tableData: [],
            dataType:[],
            selectOption:[{'label':'是',value:1},{'label':'否',value:0}],
            photoOption: [{'label': '是', 'value': 1}, {'label': '否', 'value': 0}],
            sortable:'',
            h:300,
        };
    },
    created(){
        this.type ? this.rowDrop() : null;
        this.h = window.innerHeight - 132;
    },
    mounted:function(){
        this.getDataType();
        this.getField();
    },
    beforeDestroy(){
        if(this.sortable) {
            this.sortable.destroy()
        }
    },
    methods:{
        activeCellMethod({row,column}){
            if(((this.role < 1 || this.role > 2) && this.stationKey == '1379194999') || this.stationKey != '1379194999' || row.reserved == 1){
                return false;
            }
            return true;
        },
        rowDrop () {
            this.$nextTick(() => {
                let xTable = this.$refs.xTable
                this.sortable = Sortable.create(xTable.$el.querySelector('.vxe-table tbody'), {
                    handle: '.drag-btn',
                    onEnd: ({ newIndex, oldIndex }) => {
                        let sortArr = [];
                        let currRow = this.tableData.splice(oldIndex, 1)[0]
                        this.tableData.splice(newIndex, 0, currRow)
                        this.tableData.map((item)=>{sortArr.push(item._key)})
                        console.log(sortArr);
                        if(sortArr.length){
                            this.orderField(sortArr);
                        }
                        
                    }
                })
            })
        },
        refresh(){
            this.getField();
        },
        async insertEvent(row){
            let record = {
                'createUser': this.userName,
            }
            let { row: newRow } = await this.$refs.xTable.insertAt(record, row)
            await this.$refs.xTable.setActiveCell(newRow, 'type')
        },
        editClosedEvent({ row, column }){
            this.addField(row);
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
            let data=await api.getAxios('dataType');
            if(data.status == 200){
                let dataType = [{'label':'全部','value':''}];
                data.data.map((item)=>{dataType.push({'label':item.showName,'value':item.type})});
                this.dataType = dataType;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async getField(){
            let data=await api.getAxios('field?type='+this.type);
            if(data.status == 200){
                data.data.map((item)=>{
                    item.move = "<img class='drag-btn' title='拖动' src='"+require('../../assets/cnki/drag.svg')+"' />";
                    item.createTime = ADS.getLocalTime(item.createTime);
                    item.updateTime = ADS.getLocalTime(item.updateTime);
                })
                this.tableData = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async addField(row){
            let data = await api.postAxios('field',{fieldKey:row._key,takePhoto: row.takePhoto,reserved:row.reserved ,type:row.type,memo:row.memo, fieldName:row.fieldName,fieldMeans:row.fieldMeans,required:row.required,asSearch:row.asSearch,needSort:row.needSort,form:row.form, checkRequire:row.checkRequire,userKey:this.userId});
            if(data.status == 200){
                this.getField();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async removeField(row){
            let data = await api.deleteAxios('field',{fieldKey:row._key});
            if(data.status == 200){
                this.getField();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        async orderField(arr){
            let data = await api.patchAxios('field/order',{type:this.type,fieldArr:arr});
            if(data.status != 200){
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            role: state => state.nav.role,
            stationKey: state => state.nav.stationKey,
        })
    },
    watch:{
        'type':function(newV,oldV){
            console.log(newV);
            this.getField();
            if(newV){
                this.rowDrop();
            }else{
                if(this.sortable) {
                    this.sortable.destroy()
                }
            }
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
.sortable-row-demo .vxe-body--row.sortable-ghost,
.sortable-row-demo .vxe-body--row.sortable-chosen {
    background-color: #dfecfb;
}
</style>

