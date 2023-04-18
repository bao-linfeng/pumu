<template>  
    <div class="jiapu-table-modal">
        <div class="jiapu-table-title">
            <div class="head-wrap">
                <h3 class="title">检索结果</h3>
            </div>
            <div>
                <el-button class="marginL10" type="primary" size="mini" @click="toggleColumn">{{visible ? '隐藏' : '显示'}} 操作列</el-button>
                <span>共检索出<i>{{total}}</i>部家谱</span>
            </div>
        </div>
        <div class="jiapu-vxe-wrap style3">
            <div class="jiapu-vxe-box">
                <!-- show-overflow -->
                <vxe-table
                    border
                    resizable
                    stripe
                    highlight-hover-row
                    ref="xTable"
                    :height="h"
                    @checkbox-change = "checkboxChange"
                    @checkbox-all = "checkboxChange"
                    :row-class-name="rowClassName"  
                    :cell-class-name="cellClassName"
                    :sort-config="{trigger: 'cell', orders: ['desc', 'asc', 'auto'], remote: true}"
                    @sort-change="sortChangeEvent"
                    :align="'center'"
                    :data="list">
                    <vxe-table-colgroup title="家谱信息" fixed="left">
                        <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                        <vxe-table-column v-for="(item,index) in field_main" :key="'main'+index" :width=" item.fieldName == 'surname' ? 60 : 100" :field="item.fieldName" :title="item.fieldMeans" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    </vxe-table-colgroup>
                    <vxe-table-column v-for="(item,index) in field_branch" :key="'branch'+index" width="100" :field="item.fieldName" :title="item.fieldMeans" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                    <vxe-table-column field="Filenames" title="档名" width="100" sort-by="Filenames" sortable></vxe-table-column>
                    <vxe-table-column field="fileName" title="文件标题" width="100"></vxe-table-column>
                    <vxe-table-column field="batch" title="批次号" width="100"></vxe-table-column>
                    <vxe-table-column field="createTimeO" title="导入时间" width="100" sort-by="createTime" sortable></vxe-table-column>
                    <vxe-table-column field="claimUserName" title="认领人" width="100"></vxe-table-column>
                    <vxe-table-column field="claimTimeO" title="认领时间" width="100" sort-by="claimTime" sortable></vxe-table-column>
                    <vxe-table-column title="操作" :visible="visible" fixed="right" :width="w" :cell-render="{name:'AdaiActionButton',attr:{data:actionButton},events:{'editBook':editBook,'editImage':editImage,'removeBook':removeBook,'readBook':readBook, 'lookBook': lookBook, 'catalogPass': catalogPass, 'lookLog': lookLog}}"></vxe-table-column>
                </vxe-table>
            </div>
        </div>
        <SourceModal v-if="isEditImage" v-on:close-source="isEditImage=false" :gid="gid" :gvolume="volume" />
        <!-- 记录 -->
        <LogModule v-if="isLog == 1" :gid="gid" v-on:close="closeLog" />
        <!-- 谱目编辑 -->
        <EditCatalog v-if="(isLog == 2)" :read="isRead" :attr="attr" :dataKey="gid" :vid="''" v-on:close="closeLog" />
        <!-- 查看谱目 -->
        <CatalogView v-if="isLog == 3" :read="isRead" :dataKey="gid" :vid="''" v-on:close="closeLog" v-on:save="handleSave" />
    </div>
</template>

<script>
import api from "../../api.js";
import SourceModal from "./SourceModal.vue";
import LogModule from '../../components/discussed/LogModule.vue';
import EditCatalog from '../../components/takeCamera/EditCatalog.vue';
import CatalogView from '../../components/takeCamera/CatalogView.vue';
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "genealogyTableModal",
    props:{
        list:{
            type: Array
        },
        total:{
            type: Number,
        },
        fieldFilters:{
            type: Array
        },
    },
    components: {
        SourceModal, LogModule, EditCatalog, CatalogView, 
    },
    data: () => {
        return {
            gid: '',
            volume: 10,
            isEditImage: false,
            w: 300,
            actionButton: [
                {'label': '详情', 'value': 'lookBook'}, 
                {'label': '编辑', 'value': 'editBook'},
                {'label': '记录', 'value': 'lookLog'},
                {'label': '影像', 'value': 'readBook'},
                {'label': '完结', 'value': 'catalogPass'},
            ],
            isEdit: false,
            pumu:'',
            isShow: true,
            fieldFilterList: [],
            field_main: [],
            field_branch: [],
            isLog: 0,
            isRead: false,
            visible: true,
            attr: [{'fieldMeans': '状态', 'fieldName': 'condition'}],
            h: 500,
        };
    },
    created:function(){
        this.field_main = [
            {'fieldMeans': 'ID', 'fieldName': '_key'},
            {'fieldMeans': '姓氏', 'fieldName': 'surname'},
            {'fieldMeans': '家谱谱名', 'fieldName': 'genealogyName'},
            {'fieldMeans': '出版年', 'fieldName': 'publish'},
            {'fieldMeans': '谱籍_现代地名', 'fieldName': 'place'},
            {'fieldMeans': '堂号', 'fieldName': 'hall'},
        ];

        this.field_branch = [
            {'fieldMeans': '谱籍_依谱书所载', 'fieldName': 'LocalityModern'},
            {'fieldMeans': '省', 'fieldName': 'prov'},
            {'fieldMeans': '市', 'fieldName': 'city'},
            {'fieldMeans': '区', 'fieldName': 'district'},

            {'fieldMeans': '作者姓名', 'fieldName': 'authors'},
            {'fieldMeans': '应拍卷(册)数', 'fieldName': 'hasVolume'},
            {'fieldMeans': '卷(册)说明', 'fieldName': 'volume'},
            {'fieldMeans': '缺卷(册)说明', 'fieldName': 'lostVolume'},
            {'fieldMeans': '版本类型', 'fieldName': 'version'},
            {'fieldMeans': '作者职务', 'fieldName': 'authorJob'},

            {'fieldMeans': '一世祖', 'fieldName': 'firstAncestor'},
            {'fieldMeans': '始迁祖', 'fieldName': 'migrationAncestor'},
            {'fieldMeans': '备注', 'fieldName': 'memo'},
            {'fieldMeans': '谱书编号', 'fieldName': 'bookId'},
            {'fieldMeans': 'DGS 号码', 'fieldName': 'DGS'},
            {'fieldMeans': '微卷编号', 'fieldName': 'film'},
            {'fieldMeans': '家谱群组ID', 'fieldName': 'genealogyGroupID'},

            {'fieldMeans': '重复谱书编号', 'fieldName': 'Dupbookid'},
            {'fieldMeans': '档案时间', 'fieldName': 'Filetimes'},
            // {'fieldMeans': '档名', 'fieldName': 'Filenames'},
            {'fieldMeans': '代号', 'fieldName': 'code'},
            {'fieldMeans': '认领机构', 'fieldName': 'claimOrgCode'},
            {'fieldMeans': '状态', 'fieldName': 'condition'},
            {'fieldMeans': '说明', 'fieldName': 'explain'},
            {'fieldMeans': '是否录入', 'fieldName': 'NoIndexO'},

            // {'fieldMeans': '项目ID', 'fieldName': 'Projectid'},
            // {'fieldMeans': '拍摄日期', 'fieldName': 'capturedate'},
            // {'fieldMeans': 'Media', 'fieldName': 'Media'},
            // {'fieldMeans': '重复专案ID', 'fieldName': 'DupProjectID'},
            // {'fieldMeans': '认领单位', 'fieldName': 'claim'},
            // {'fieldMeans': '认领日期', 'fieldName': 'claimDate'},
            // {'fieldMeans': '拍摄期限', 'fieldName': 'shootingPeriod'},
            // {'fieldMeans': '前次认领单位1', 'fieldName': 'pervious1'},
            // {'fieldMeans': '前次认领日期1', 'fieldName': 'perviousDate1'},
            // {'fieldMeans': '前次认领单位2', 'fieldName': 'pervious2'},
            // {'fieldMeans': '前次认领日期2', 'fieldName': 'perviousDate2'},
            // {'fieldMeans': '前次认领单位3', 'fieldName': 'pervious3'},
            // {'fieldMeans': '前次认领日期3', 'fieldName': 'perviousDate3'},
            // {'fieldMeans': '序号', 'fieldName': 'VolumeFst'},
            // {'fieldMeans': '起年', 'fieldName': 'startYear'},
        ];
    },
    mounted:function(){
        this.h = window.innerHeight - 50 - 50 - 60 - 195 - 40;
        if(this.role < 1 || this.role > 3){
            this.w = 240;
            this.actionButton = [
                {'label': '详情', 'value': 'lookBook'}, 
                {'label': '记录', 'value': 'lookLog'},
                {'label': '影像', 'value': 'readBook'},
                {'label': '完结', 'value': 'catalogPass'},
            ];
        }else{
            if(this.stationKey == '1379194999'){
                this.w = 330;
                this.actionButton = [
                    {'label': '详情', 'value': 'lookBook'}, 
                    {'label': '影像', 'value': 'readBook'},
                    {'label': '记录', 'value': 'lookLog'},
                    {'label': '删除', 'value': 'removeBook'},
                    {'label': '完结', 'value': 'catalogPass'},
                ];
            }
        }
        
        this.initData();
    },
    methods:{
        sortChangeEvent({column, property, order, sortBy, sortList, $event}){
            console.log(property, order, sortBy);
            this.$emit('get-genealogy', {'prop': sortBy, 'order': order});
        },
        cellClassName({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex }){
            if(row.changeFieldArr && row.changeFieldArr.indexOf(column.property) > -1){
                return 'row-blue';
            }
        },
        rowClassName ({ row, rowIndex }) {
            // return 'row-orange';
        },
        toggleColumn(){
            this.visible = !this.visible;
            this.$nextTick(() => {
                this.$refs.xTable.refreshColumn();
            });
            // let timer = setTimeout(() => {
            //     this.$refs.xTable.refreshColumn();
            //     clearTimeout(timer);
            //     timer = null;
            // }, 200);
        },
        handleSave(){

        },
        closeLog(){
            this.isLog = 0;
            this.isRead = false;
        },
        lookLog({row}){
            this.isLog = 1;
            this.gid = row._key;
        },
        initData(){
            let fieldFilterList = [], fieldFilter = ['genealogyName', 'publish', 'surname', 'place'];
            this.fieldFilters.forEach((ele) => {
                if(fieldFilter.indexOf(ele.value) > -1){

                }else{
                    fieldFilterList.push(ele);
                }
            });
            this.fieldFilterList = fieldFilterList;
        },
        closeEdit(flag){
            this.isEdit = false;
            this.isShow = true;
            flag ? this.$emit('get-genealogy','') : null;
        },
        checkboxChange({records}){
            records.map((item)=>{
                item.select = true;
            });
            this.$emit('checkbox-change',records);
        },
        editBook({row}){// 编辑谱目
            // if(row.resource < 3){
            //     this.gid = row._key;
            //     this.pumu = row;
            //     this.isEdit = true;
            // }
            this.gid = row._key;
            this.pumu = row;
            this.isEdit = true;
            this.isShow = false;
            this.isLog = 2;
            this.isRead = false;
        },
        lookBook({row}){// 查看谱目
            this.gid = row._key;
            this.pumu = row;
            this.isEdit = true;
            this.isShow = true;
            this.isLog = 3;
            this.isRead = true;
        },
        editImage({row}){// 编辑影像资料
            // if(row.resource == 1){
            //     this.gid = row._key;
            //     this.isEditImage = true;
            // }
            this.gid = row._key;
            this.isEditImage = true;
        },
        catalogPass({row}){
            if(row.condition != 'nf'){
                return this.$message({message: '该谱目目前状态不允许提交完结！', type: 'warning'});;
            }
            this.$confirm('是否确认完结此家谱任务?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.catalogPassCheck(row._key);
            }).catch(() => {});
        },
        async catalogPassCheck(catalogKey){//完结家谱判断
            let data = await api.getAxios('v3/camera/catalog/catalogCanPass?catalogKey='+catalogKey);
            if(data.status == 200){
                this.catalogPassApi(catalogKey);
            }else if(data.status == 301){
                this.$confirm('该谱目应有卷册和实拍卷册不一致, 是否继续完结此家谱任务?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.catalogPassApi(catalogKey);
                }).catch(() => {});
            }else{
                this.$message({message: data.msg, type: 'warning'});
            }
        },
        async catalogPassApi(catalogKey){//完结家谱
            let data = await api.patchAxios('v3/camera/catalog/catalogPass2',{'catalogKey': catalogKey, 'status': 7, 'userKey':this.userId, 'siteKey':this.stationKey, 'orgKey': this.orgId});
            if(data.status == 200){
                this.$emit('get-genealogy','');
            }else{
                this.$message({message: data.msg, type: 'warning'});
            }
        },
        removeBook({row}){// 删除谱目或退出共享
            this.$confirm('此操作将永久'+(row.siteKey == this.stationKey ? '删除该谱目数据' : '退出分享')+',是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                if(row.siteKey == this.stationKey){
                    this.deleteGenealogy([row._key]);
                }else{
                    this.deleteShare(row._key);
                }
            }).catch(() => {});
        },
        deleteGenealogy:async function(checkList){//删除
            let data=await api.deleteAxios('catalog',{'catalogKeyArr':checkList, 'userKey':this.userId, 'siteKey':this.stationKey, 'orgKey': this.orgId});
            if(data.status == 200){
                this.$emit('get-genealogy','');
            }else{
                this.$message({message: '删除家谱出错，请重新删除',type: 'warning'});
            }
        },
        deleteShare:async function(gid){// 退出共享
            let data=await api.deleteAxios('catalog/exitShare',{'catalogKey':gid,'userKey':this.userId,'siteKey':this.stationKey});
            if(data.status == 200){
                this.$message({message: '退出共享成功',type: 'success'});
                this.$emit('get-genealogy','');
            }else{
                this.$message({message: '退出共享出错，请重新退出',type: 'warning'});
            }
        },
        readBook({row}){// 阅读影像
            if(row.imageLink){
                window.open(row.imageLink);
            }else{
                this.$XModal.message({ message: '暂时无法查看影像', status: 'warning' });
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            role: state => state.nav.role,
            stationKey: state => state.nav.stationKey,
            orgId: state => state.nav.orgId
        })
    },
    watch: {
        'fieldFilters': function(nv, ov){
            this.initData();
        },
    },
};
</script>
<style scoped lang="scss">
.jiapu-table-modal{
    width: calc(100% - 40px);
    margin: 0 20px;
    background-color: #fff;
    .jiapu-table-title{
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        .head-wrap{
            display: flex;
            align-items: center;
        }
        h3{
            color: #344B5A;
            height: 16px;
            line-height: 16px;
            border-left: 2px solid #4C95FF;
            padding-left: 20px;
        }
        span{
            color: #7E8E98;
            margin-right: 20px;
            margin-left: 10px;
            letter-spacing: 1px;
            i{
                font-style: normal;
                letter-spacing: 0px;
                margin: 0 5px;
            }
        }
    }
    .jiapu-vxe-wrap{
        position: relative;
        width: 100%;
        // overflow-x: auto;
        .jiapu-vxe-box{
            position: relative;
            width: 100%;
            // width: 3000px;
        }
    }
}
.marginL10{
    margin-left: 10px;
}
.row-blue{
    color: #358acd;
    font-weight: bold;
}
</style>

