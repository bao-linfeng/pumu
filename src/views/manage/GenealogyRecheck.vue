<template>  
    <div class="wrap">
        <Sidebar />
        <div class="content">
            <div class="nav-wrap">
                <div class="nav-left">
                    <h3 class="title">谱目复检列表(总共{{tableData.length}}条数据)</h3>
                </div>
                <div class="nav-left">
                    <vxe-button content="批量重复" @click="checkCatalogArr(3)"></vxe-button>
                    <vxe-button content="批量可拍" @click="checkCatalogArr(2)"></vxe-button>
                    <vxe-button content="批量无效" @click="checkCatalogArr(4)"></vxe-button>
                </div>
            </div>
            <p class="condition">谱状态说明:f,审核通过且已拍摄;nf,审核通过未拍摄;f,无效谱;d,谱书重复;m,待议谱。</p>
            <div class="table-wrap">
                <vxe-table
                    border
                    class="adai-table"
                    resizable
                    keep-source
                    show-overflow
                    highlight-current-row
                    ref="xTable"
                    :height="h*0.6"
                    :align="'center'"
                    :data="tableData"
                    :cell-class-name="cellClassName"
                    :row-class-name="rowClassName"
                    @edit-closed="editClosedEvent"
                    @checkbox-change = "checkboxChange"
                    @checkbox-all = "checkboxChange"
                    :edit-config="{trigger: 'click', mode: 'row',showStatus: true, activeMethod:activeCellMethod}"
                    @cell-click="cellClickEvent">
                    <vxe-table-colgroup title="可拍信息" fixed="left" width="620">
                        <vxe-table-column type="checkbox" field="checkbox" width="60"></vxe-table-column>
                        <vxe-table-column field="fileName" width="100" title="文件标题"></vxe-table-column>
                        <vxe-table-column field="action" title="谱目复审" width="240" :cell-render="{name:'AdaiActionButton',attr:{data: [{'label':'重复','value':'d'}, {'label':'可拍','value':'nf'}, {'label':'打回','value':'m'}, {'label':'无效','value':'r'}]},events:{'d': codeSubmit2d, 'nf': codeSubmit2nf, 'm': codeSubmit2m, 'r': codeSubmit2r}}"></vxe-table-column>
                        <vxe-table-column v-for="(item,index) in field_main" :key="'field_main'+index" width="100" :field="item.fieldName" :title="item.fieldMeans"></vxe-table-column>
                        <vxe-table-column field="publicTaskO" width="100" title="谱目类型"></vxe-table-column>
                    </vxe-table-colgroup>
                    
                    <vxe-table-column v-for="(item,index) in field_branch" :key="'field_branch'+index" width="100" :field="item.fieldName" :title="item.fieldMeans"></vxe-table-column>
                    <vxe-table-column field="annex" fixed="right" title="待提交原因" width="160" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'附件','value':'annex'}, {'label':'快捷查询','value':'singleQuick'}]},events:{'annex':annex, 'singleQuick': singleQuick}}"></vxe-table-column>
                </vxe-table>
            </div>
            <RepeatJiapuModal :row="row" :h="h" :pumuThead="pumuThead" :isF="false" />
        </div>
        <AnnexModal v-if="isShowAnnex" :gid="gid" :createUser="createUser" :row="annexRow" v-on:close-annex="isShowAnnex = false" :active="active" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import Sidebar from "../../components/sidebar/Sidebar.vue";
import AnnexModal from "../../components/QingTimeGenealogy/AnnexModal.vue";
import RepeatJiapuModal from "../../components/batchManage/RepeatJiapuModal.vue";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "genealogyRecheck",
    components: {
        AnnexModal,RepeatJiapuModal, Sidebar,
    },
    data: () => {
        return {
            tableData: [],
            active: 4,
            row: {},
            createUser: '',
            h: 1080,
            isShowAnnex: false,
            annexRow: '',
            gid: '',
            pumuThead: [],
            pumuTheads: [],
            repeatNum: 0,
            collapsable: false,
            catalogKeyArr: [],
            field_main: [],
            field_branch: [],
        };
    },
    created:function(){
        this.h = window.innerHeight - 110;
        this.field_main = [
            {'fieldMeans': '家谱姓氏', 'fieldName': 'surname'},
            {'fieldMeans': '家谱谱名', 'fieldName': 'genealogyName'},
            {'fieldMeans': '出版年', 'fieldName': 'publish'},
            {'fieldMeans': '谱籍_依谱书所载', 'fieldName': 'LocalityModern'},
            {'fieldMeans': '卷(册)说明', 'fieldName': 'volume'},
            {'fieldMeans': '堂号', 'fieldName': 'hall'},
        ];

        this.field_branch = [
            {'fieldMeans': '作者姓名', 'fieldName': 'authors'},
            {'fieldMeans': '可拍卷数', 'fieldName': 'hasVolume'},
            {'fieldMeans': '缺卷(册)说明', 'fieldName': 'lostVolume'},
            {'fieldMeans': '版本类型', 'fieldName': 'version'},
            {'fieldMeans': '作者职务', 'fieldName': 'authorJob'},

            {'fieldMeans': '一世祖', 'fieldName': 'firstAncestor'},
            {'fieldMeans': '始迁祖', 'fieldName': 'migrationAncestor'},
            {'fieldMeans': '备注', 'fieldName': 'memo'},
            {'fieldMeans': '重复谱书编号', 'fieldName': 'Dupbookid'},
            {'fieldMeans': '状态', 'fieldName': 'condition'},
            {'fieldMeans': '说明', 'fieldName': 'explain'},
            {'fieldMeans': '档案时间', 'fieldName': 'Filetimes'},
            {'fieldMeans': '档名', 'fieldName': 'Filenames'},
            {'fieldMeans': '代号', 'fieldName': 'code'},
            {'fieldMeans': '谱籍_现代地名', 'fieldName': 'place'},
            {'fieldMeans': '谱书编号', 'fieldName': 'bookId'},
            {'fieldMeans': 'DGS 号码', 'fieldName': 'DGS'},
            {'fieldMeans': '微卷编号', 'fieldName': 'film'},
            {'fieldMeans': '家谱群组ID', 'fieldName': 'genealogyGroupID'},
            {'fieldMeans': '项目ID', 'fieldName': 'Projectid'},
            {'fieldMeans': '拍摄日期', 'fieldName': 'capturedate'},
            {'fieldMeans': 'Media', 'fieldName': 'Media'},
            {'fieldMeans': '重复专案ID', 'fieldName': 'DupProjectID'},
            {'fieldMeans': '认领单位', 'fieldName': 'claim'},
            {'fieldMeans': '认领日期', 'fieldName': 'claimDate'},
            {'fieldMeans': '拍摄期限', 'fieldName': 'shootingPeriod'},
            {'fieldMeans': '前次认领单位1', 'fieldName': 'pervious1'},
            {'fieldMeans': '前次认领日期1', 'fieldName': 'perviousDate1'},
            {'fieldMeans': '前次认领单位2', 'fieldName': 'pervious2'},
            {'fieldMeans': '前次认领日期2', 'fieldName': 'perviousDate2'},
            {'fieldMeans': '前次认领单位3', 'fieldName': 'pervious3'},
            {'fieldMeans': '前次认领日期3', 'fieldName': 'perviousDate3'},
            {'fieldMeans': '序号', 'fieldName': 'VolumeFst'},
            {'fieldMeans': '起年', 'fieldName': 'startYear'},
        ];
    },
    mounted:function(){
        this.getPumuTable();
        this.getCheckLogCodeSubmit();
    },
    methods:{
        singleQuick({ row }){
            console.log(row);
            window.open('/'+this.pathname+'/singleQuickSearch?id='+row._key, '_blank');
        },
        checkboxChange({records}){
            let catalogKeyArr = [];
            records.forEach((ele) => {
                catalogKeyArr.push(ele._key);
            });
            this.catalogKeyArr = catalogKeyArr;
        },
        async checkCatalogArr(codeSubmit){
            if(!this.catalogKeyArr.length){
                return this.$XModal.message({message: '请勾选可拍家谱', status: 'warning'});
            }
            if(confirm('确认要批量做此操作吗？')){
                this.changeLoading();
                let result = await api.patchAxios('v3/review/catalog/checkBatch', {'catalogKeyArr': this.catalogKeyArr, 'codeSubmit': codeSubmit, 'userKey': this.userId, 'siteKey': this.stationKey});
                this.changeLoading(false);
                if(result.status == 200){
                    this.getCheckLogCodeSubmit();
                }else{
                    this.$XModal.message({ message: result.msg, status: 'warning' })
                }
            }
        },
        codeSubmit2d({row}){
            console.log(row);
            if(confirm('确认此操作吗？')){
                this.checkCatalog(row._key, 3);
            }
        },
        codeSubmit2nf({row}){
            console.log(row);
            if(confirm('确认此操作吗？')){
                this.checkCatalog(row._key, 2);
            }
            
        },
        codeSubmit2m({row}){
            console.log(row);
            if(confirm('确认此操作吗？')){
                this.checkCatalog(row._key, 5);
            }
            
        },
        codeSubmit2r({row}){
            console.log(row);
            if(confirm('确认此操作吗？')){
                this.checkCatalog(row._key, 4);
            }
            
        },
        async checkCatalog(catalogKey, codeSubmit){
            this.changeLoading();
            let result = await api.patchAxios('v3/review/catalog/check', {'catalogKey': catalogKey, 'codeSubmit': codeSubmit, 'userKey': this.userId, 'siteKey': this.stationKey});
            this.changeLoading(false);
            if(result.status == 200){
                this.getCheckLogCodeSubmit();
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
        changeLoading(flag = true){
            this.$store.dispatch('setPropertyValue',{'property':'loading','value': flag});
        },
        annex({row}){
            this.annexRow = row;
            this.gid = row._key;
            this.isShowAnnex = true;
        },
        collapsableEvent () {
            this.collapsable = !this.collapsable;
            const xTable = this.$refs.xTable;
            xTable.refreshColumn();
        },
        activeCellMethod({row,column}){//控制编辑
            return true;
        },
        editClosedEvent({row}){
            
        },
        cellClickEvent({row,column}){
            if(column.property == 'action'){
                return false;
            }
            if(column.property == 'checkbox'){
                return false;
            }
            if(column.property == 'toggle'){
                this.collapsableEvent();
                return false;
            }
            if(column.property == 'action' || column.property == 'willIn' || column.property == 'annex' || column.property == 'delete' || column.property == 'needFill' || column.property == 'needImage'){
                this.row = {};
            }else{
                this.row = row;
            }
        },
        rowClassName ({ row, rowIndex }) {
            // if(row.suggIn) {
            //     return 'row-red'
            // }
        },
        cellClassName({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex }){
            if(row.updateKeyArray && row.updateKeyArray.indexOf(column.property) > -1){
                return 'row-red'
            }
        },
        async getCheckLogCodeSubmit(){
            this.changeLoading();
            let result = await api.getAxios('v3/review/checkLogCodeSubmit');
            this.changeLoading(false);
            if(result.status == 200){
                let repeatNum = 0;
                result.data.map((item)=>{
                    item.publicTaskO = item.publicTask ? '公开' : '私有';
                    item.toggle = '>';
                    item.addInformation = (item.needFill ? '补充字段 ' : '')+(item.needImage ? '临时影像' : '');
                    item.suggIn = item.suggIn ? '是' : '否';
                    item.hasIn = item.hasIn ? '是' : '否';
                    item.location = item.location && item.location.length && item.location.join(',');
                    item.address = (item.prov || '') + ' ' + (item.city || '') + ' ' + (item.district || '');
                    item.willIns = item.willIn == 1 ? '是' : '否';
                    if(item.suggIn == '否'){
                        repeatNum = repeatNum + 1;
                    }
                });
                this.repeatNum = repeatNum;
                this.tableData = result.data;
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
        async getPumuTable(){// 谱目全部表头
            let result = await api.getAxios('field?type=家谱');
            if(result.status == 200){
                let pumuTheads = [];
                result.data.map((item)=>{
                    if(['missVolumeSupplement','hasVolume','hasImage','genealogyName','publish','place','surname','authors','volume','hall','publishAD','address','authorFst','LocalityModern','lostVolume'].indexOf(item.fieldName) > -1){
                        
                    }else{
                        pumuTheads.push(item);
                    }
                });
                this.pumuTheads = pumuTheads;
                this.pumuThead = result.data;
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
    },
    computed: {
        ...mapState({
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            pathname: state => state.nav.pathname,
        })
    },
    watch:{
        
    },
};
</script>
<style scoped lang="scss">
.wrap{
    position: relative;
    // width: 100%;
    // height: 100%;
    width: calc(100% - 200px);
    height: 100%;
    padding-left: 200px;
    text-align: left;
    .content{
        position: relative;
        width: 100%;
        height: 100%;
        background: #EFF1F5;
        .nav-wrap{
            position: relative;
            padding: 0 20px;
            width: calc(100% - 40px);
            display: flex;
            height: 60px;
            justify-content: space-between;
            align-items: center;
            .nav-left{
                position: relative;
                height: 100%;
                display: flex;
                align-items: center;
            }
        }
        .table-wrap{
            width: 100%;
        }
        .place-wrap{
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 500px;
            z-index: 10000;
            background-color: #fff;
        }
    }
}
.needFill-box{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    padding: 20px;
    border-radius: 5px;
    z-index: 1000;
    box-shadow: 0 0 2px 3px #ddd;
    .needFill-close{
        position: absolute;
        top: 20px;
        right: 20px;
        cursor: pointer;
        width: 20px;
        height: 20px;
    }
}
</style>

