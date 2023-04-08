<template>  
    <div class="section-box">
        <div class="section-box-tab">
            <!-- ,'单条检索' -->
            <span :class="tabIndex == index ? 'active' : ''" v-for="(item,index) in ['重复可疑数据','附近相关数据']" :key="'tab'+index" @click="tabIndex = index">{{item}}{{index == 2 ? '' : ('('+(index == 1 ? nearAllData.length : dubiousData.length)+')')}}</span>
            <span>{{row && row.genealogyName}}  {{row.prov}}{{row.city}}{{row.district}}</span>
        </div>
        <div class="table-wrap" v-if="isDataRepeat" v-show="tabIndex === 0">
            <vxe-table
                border
                class="adai-table"
                resizable
                :keep-source="true"
                ref="xTable6"
                :height="h*0.4"
                :align="'center'"
                :edit-config="{trigger: 'click', mode: 'row',showStatus: true,activeMethod:activeCellMethod}"
                @cell-click="cellClickEvent"
                :data="dubiousData">
                <vxe-table-colgroup title="家谱信息" fixed="left">
                    <vxe-table-column field="rules" title="命中规则与风险" width="140"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="谱名" width="100"></vxe-table-column>
                    <vxe-table-column field="place" title="谱籍地" width="100"></vxe-table-column>
                    <vxe-table-column field="publish" title="出版年" width="100"></vxe-table-column>
                    <vxe-table-column field="_key" title="谱目ID" width="100"></vxe-table-column>
                </vxe-table-colgroup>
                
                <vxe-table-column v-for="(item,index) in repeatDetailField" :visible="collapsable" width="100" :key="'dubious'+index" :field="item.fieldName" :title="item.fieldMeans" :edit-render="{name: 'input', attrs: {type: 'text'}}"></vxe-table-column>
                <vxe-table-column title="阅读影像" :width="80" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'阅读','value':'readBook'}]},events:{'readBook':readBook}}"></vxe-table-column>
                <vxe-table-colgroup title="操作" fixed="right" width="80">
                    <vxe-table-column field="repeatMark" title="标记家谱" width="90" :cell-render="{name:'repeatMarkModal',attr:{label:'标记'},events:{'click':repeatMark}}"></vxe-table-column>
                    <!-- <vxe-table-column title="删除" width="80" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'删除','value':'deleteJia'}]},events:{'deleteJia':deleteGenealogy}}"></vxe-table-column> -->
                </vxe-table-colgroup>
            </vxe-table> 
        </div>
        <div :class="'table-wrap'+ (isF ? '' : ' place-wrap')" v-if="tabIndex === 1">
            <vxe-table
                border
                class="adai-table"
                resizable
                ref="xTable7"
                :height="isF ? h*0.4 : h2"
                :align="'center'"
                :data="nearData">
                <vxe-table-colgroup title="谱名" fixed="left" width="160">
                    <vxe-table-column field="distance" title="距离(km)" width="60"></vxe-table-column>
                    <vxe-table-column field="genealogyName" title="谱名" width="100"></vxe-table-column>
                    <vxe-table-column field="_key" title="谱目ID" width="100"></vxe-table-column>
                </vxe-table-colgroup>
                <vxe-table-column v-for="(item,index) in nearDataField"  width="100" :key="'near'+index" :field="item.fieldName" :title="item.fieldMeans"></vxe-table-column>
                <vxe-table-column title="阅读影像" :width="80" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label':'阅读','value':'readBook'}]},events:{'readBook':readBook}}"></vxe-table-column>
            </vxe-table>
            <button class="more" @click="getMore" v-if="!isMore">更多</button>
        </div>
        <div class="single-search" :style="{height: h*0.4+'px'}" v-if="tabIndex === 2">
            <SearchModal :fieldFilters="fieldFilters" v-on:get-genealogy="getGenealogy" />
            <GenealogyTableModal v-if="fieldFilters.length" :isShow="true" :fieldFilters="fieldFilters" :total="total" :list="list" v-on:checkbox-change="checkboxChange" v-on:get-genealogy="getJiapuList" />
            <vxe-pager
                align="center"
                @page-change = "changePage"
                :current-page.sync="page"
                :page-size.sync="limit"
                :total="total"
                :layouts="['PrevJump', 'PrevPage', 'JumpNumber','NextPage', 'NextJump', 'Sizes', 'FullJump', 'Total']">
            </vxe-pager>
        </div>
        <Loading v-show="loading" />
    </div>
</template>

<script>
import SearchModal from "../myGenealogy/SearchModal.vue";
import GenealogyTableModal from "../myGenealogy/GenealogyTableModal.vue";
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    components: {
        SearchModal,GenealogyTableModal
    },
    name: "RepeatJiapuModal",
    props:{
        h:{
            type: Number
        },
        row:{
            type: Object
        },
        pumuThead: {
            type: Array
        },
        active: {
            type: Number
        },
        isF:{
            type: Boolean,
            default: false
        },
    },
    data: () => {
        return {
            tabIndex: 0,
            nearData: [],
            nearDataField: [],
            nearAllData: [],
            dubiousData: [],
            h2: 1080,
            isMore: false,
            collapsable: true,
            repeatDetailFieldO: [],
            repeatDetailField: [],

            keyWordObj: '',
            libKey: '',
            equal: 1,
            orgKey: '',
            begYear: '',
            endYear: '',
            noPublishAD: '',
            prop: '',
            order: '',
            page: 1,
            limit: 20,
            list:[],
            total:0,
            fieldFilters:[],
            loading: false,
            checkList: [],
            startTime: '',
            endTime: '',
            fileName: '',
            isPublish: '',
            isPlace: '',
            condition: '',
            isDataRepeat: true,
        };
    },
    mounted:function(){
        this.h2 =  window.innerHeight - 40;
        this.getFieldFilterList();

        let nearDataField = [],repeatDetailField = [],repeatDetailFieldO = [];
        this.pumuThead.forEach((ele) => {
            if(ele.fieldName === 'genealogyName'){
                
            }else{
                nearDataField.push(ele);
            }
            // if(ele.fieldName === 'genealogyName' 
            // || ele.fieldName === 'publish' 
            // || ele.fieldName === 'publishAD' 
            // || ele.fieldName === 'address' 
            // || ele.fieldName === 'place' 
            // || ele.fieldName === 'surname' 
            // || ele.fieldName === 'authors' 
            // || ele.fieldName === 'volume' 
            // || ele.fieldName === 'lostVolume' 
            // || ele.fieldName === 'hall' 
            // || ele.fieldName === 'hasVolume'){
            //     repeatDetailFieldO.push(ele);
            // }else{
            //     repeatDetailField.push(ele);
            // }
        });

        // 重复可以数据表头
        repeatDetailField = [
        // {'fieldName': 'genealogyName', 'fieldMeans': '谱名'},
        // {'fieldName': 'publish', 'fieldMeans': '出版年'},
        // {'fieldName': 'place', 'fieldMeans': '谱籍地'},
        {'fieldName': 'surname', 'fieldMeans': '姓氏'},
        {'fieldName': 'authors', 'fieldMeans': '作者'},
        {'fieldName': 'volume', 'fieldMeans': '卷数'},
        {'fieldName': 'hall', 'fieldMeans': '堂号'},
        {'fieldName': 'missVolumeSupplement', 'fieldMeans': '缺卷补充'},
        {'fieldName': 'lostVolume', 'fieldMeans': '缺卷'},
        {'fieldName': 'hasVolume', 'fieldMeans': '实拍册数'},
        {'fieldName': 'LocalityModern', 'fieldMeans': '谱籍现代地名'},
        {'fieldName': 'prov', 'fieldMeans': '省'},
        {'fieldName': 'city', 'fieldMeans': '市'},
        {'fieldName': 'district', 'fieldMeans': '区'},
        {'fieldName': 'bookId', 'fieldMeans': '谱书编号'},
        {'fieldName': 'DGS', 'fieldMeans': 'DGS 号码'},
        {'fieldName': 'film', 'fieldMeans': '微卷编号'},
        {'fieldName': 'genealogyGroupID', 'fieldMeans': '家谱群组ID'},
        {'fieldName': 'Projectid', 'fieldMeans': '项目ID'},
        {'fieldName': 'capturedate', 'fieldMeans': '拍摄日期'},
        {'fieldName': 'Media', 'fieldMeans': 'Media号'},
        {'fieldName': 'memo', 'fieldMeans': '备注'},
        {'fieldName': 'Dupbookid', 'fieldMeans': '重复谱书编号'},
        {'fieldName': 'Filetimes', 'fieldMeans': '档案时间'},
        {'fieldName': 'Filenames', 'fieldMeans': '档名'},
        {'fieldName': 'code', 'fieldMeans': '代号'},
        {'fieldName': 'VolumeFst', 'fieldMeans': '序号'},
        {'fieldName': 'condition', 'fieldMeans': '状态'},
        {'fieldName': 'explain', 'fieldMeans': '说明'}
        ];
        
        this.nearDataField = nearDataField;
        this.repeatDetailFieldO = repeatDetailFieldO;
        this.repeatDetailField = repeatDetailField;
    },
    methods:{
        cellClickEvent({row,column}){
            if(column.property == 'toggle'){
                this.collapsable = !this.collapsable;
                const xTable = this.$refs.xTable6;
                xTable.refreshColumn();
            }
        },
        getFieldFilterList:async function(){// 检索字段列表
            let data = await api.getAxios('field/filter?type=家谱&asSearch=1');
            if(data.status == 200){
                let fieldFilters = [];
                data.data.map((item)=>{fieldFilters.push({'label':item.fieldMeans,'value':item.fieldName})});
                this.fieldFilters = fieldFilters;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        changePage({currentPage}){// 页码切换回调
            this.page = currentPage;
            this.getJiapuList();
        },
        getGenealogy(data){// 检索家谱
            let keyWordObj = {};
            this.libKey = data['libKey'];
            this.equal = data['equal'];
            this.orgKey = data['orgKey'];
            this.begYear = data['begYear'] || '';
            this.endYear = data['endYear'] || '';
            this.noPublishAD = data['noPublishAD'] ? 1 : '';
            this.startTime = data['startTime'] || '';
            this.endTime = data['endTime'] || '';
            this.fileName = data['fileName'] || '';
            this.isPublish = data['isPublish'] ? 1 : '';
            this.isPlace = data['isPlace'] ? 1 : '';
            this.condition = data['condition'] || '';
            for(let key in data){
                if(key == 'condition' || key == 'isPublish' || key == 'isPlace' || key == 'fileName' || key == 'startTime' || key == 'endTime' || key == 'libKey' || key == 'equal' || key == 'orgKey' || key == 'begYear' || key == 'endYear' || key == 'noPublishAD'){

                }else{
                    keyWordObj[key] = data[key];
                }
            }
            this.keyWordObj = keyWordObj;
            this.getJiapuList();
        },
        getJiapuList:async function(){// 谱目列表
            this.loading = true;
            let data = await api.getAxios('catalog/back?siteKey='+this.stationKey+'&startFileTimes=&endFileTimes='+'&condition='+this.condition+'&isPublish='+this.isPublish+'&isPlace='+this.isPlace+'&noPublishAD='+this.noPublishAD+'&fileName='+this.fileName+'&startTime='+this.startTime+'&endTime='+this.endTime+'&begYear='+this.begYear+'&endYear='+this.endYear+'&libKey='+this.libKey+'&orgKey='+this.orgKey+'&equal='+this.equal+'&keyWordObj='+JSON.stringify(this.keyWordObj)+'&prop='+this.prop+'&order='+this.order+'&page='+this.page+'&limit='+this.limit);
            this.loading = false;
            if(data.status == 200){
                this.list = data.result.list;
                this.list.map((item)=>{
                    item.address = (item.prov || '') + ' ' + (item.city || '') + ' ' + (item.district || '');
                    item.hasImage = item.hasImage == 1 ? '有' : '无';
                    item.libsStr = item.libs.join(',');
                });
                this.total = data.result.total;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        checkboxChange(data){// 复选框切换回调
            console.log(data);
            this.checkList = data;
        },
        readBook({row}){// 阅读影像
            // if(row.hasImage){
            //     if(row.readType === 'jump'){
            //         window.open(row.imageLink);
            //     }else{
            //         this.$router.push('/'+window.localStorage.getItem('pathname')+'/view?gid='+row._key+'&volume=1&page=1');
            //     }
            //     // this.$router.push('/'+window.localStorage.getItem('pathname')+'/view?gid='+row._key+'&volume=1&page=1');
            // }else{
            //     this.$XModal.message({ message: '暂无影像', status: 'warning' });
            // }
            if(row.imageLink){
                window.open(row.imageLink);
            }else{
                this.$XModal.message({ message: '暂无无法查看影像', status: 'warning' });
            }
        },
        activeCellMethod({row,column}){//控制编辑
            if(this.active != 3 || !row._key){
                return false;
            }
            return true;
        },
        deleteGenealogy:async function({row}){//删除
            if(row._key){
                let data=await api.deleteAxios('catalog',{'catalogKeyArr': [row._key],'userKey':this.userId,'siteKey':this.stationKey});
                if(data.status == 200){
                    let dubiousData = [];
                    this.dubiousData.map((item) => {
                        if(item._key == row._key){

                        }else{
                            dubiousData.push(item);
                        }
                    });
                    this.dubiousData = dubiousData;
                }else{
                    this.$message({message: '删除家谱出错，请重新删除',type: 'warning'});
                }
            }else{
                this.$message({message: '该家谱属于痕迹，无法删除',type: 'warning'});
            }
        },
        changeLoading(flag = true){
            this.$store.dispatch('setPropertyValue',{'property':'loading','value': flag});
        },
        repeatMark:async function({row}){// 标记重复家谱
            this.$confirm('此操作将标记家谱来源, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.repeatMarkApi(row);
            }).catch(() => {});
            
        },
        repeatMarkApi:async function(row){// 标记重复家谱
            let dubiousData = [];
            this.changeLoading();
            let data = await api.patchAxios('data/repeatMark',{'originKey':this.row._key,'repeatKey':row._key});
            this.changeLoading(false);
            if(data.status == 200){
                this.dubiousData.map((item)=>{
                    item.repeatMark = item._key == row._key ? 1 : 0;
                    dubiousData.push(item);
                });
                this.dubiousData = dubiousData;
                this.$XModal.message({ message: '标记成功', status: 'success' });
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        getDataRepeatDetail:async function(dataKey){// 重复可疑数据
            this.isDataRepeat = false;
            this.changeLoading();
            let data=await api.getAxios('data/repeatDetail?dataKey='+dataKey);
            this.changeLoading(false);
            this.isDataRepeat = true;
            if(data.status == 200){
                let dubiousData = data.data;
                dubiousData.map((item)=>{
                    item.toggle = '>';
                    if(item.rule && item.rule.length){
                        let rule = item.rule,rules='';
                        rule.map((item2)=>{
                            rules = rules + item2.rule+'('+item2.repeatPercent+'%)  ';
                        });
                        item.rules = rules;
                    }
                });
                this.dubiousData = dubiousData;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getMore(){
            this.isMore = true;
            this.nearData = this.nearAllData;
        },
        getDataNear:async function(dataKey){// 附近谱目
            this.isMore = false;
            let data=await api.getAxios('data/near?dataKey='+dataKey+'&siteKey='+this.stationKey);
            if(data.status == 200){
                let nearData = [];
                if(data.data.length < 10){
                    this.isMore = true;
                }
                data.data.map((item,i)=>{
                    item.distance = (item.distance/1000).toFixed(3)
                    item.address = (item.prov || '') + ' ' + (item.city || '') + ' ' + (item.district || '');
                    if(i < 10){
                        nearData.push(item);
                    }
                });
                this.nearData = nearData;
                this.nearAllData = data.data;
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
        'fieldFilters':function(newV,oldV){
            this.getJiapuList();
        },
        'row':function(nv,ov){
            console.log(nv);
            if(nv && nv._key){
                this.getDataRepeatDetail(nv._key);
                this.getDataNear(nv._key);
            }
        },
        'pumuThead': function(nv,ov){
            // console.log(nv);
            let nearDataField = [],repeatDetailField = [],repeatDetailFieldO = [];
            nv.forEach((ele) => {
                if(ele.fieldName === 'genealogyName'){
                    
                }else{
                    nearDataField.push(ele);
                }
                // if(ele.fieldName === 'genealogyName' 
                // || ele.fieldName === 'publish' 
                // || ele.fieldName === 'publishAD' 
                // || ele.fieldName === 'address' 
                // || ele.fieldName === 'place' 
                // || ele.fieldName === 'surname' 
                // || ele.fieldName === 'authors' 
                // || ele.fieldName === 'volume' 
                // || ele.fieldName === 'lostVolume' 
                // || ele.fieldName === 'hall' 
                // || ele.fieldName === 'hasVolume'){
                //     repeatDetailFieldO.push(ele);
                // }else{
                //     repeatDetailField.push(ele);
                // }
            });
            
            this.nearDataField = nearDataField;
            this.repeatDetailFieldO = repeatDetailFieldO;
            // this.repeatDetailField = repeatDetailField;
        }
    }
};
</script>
<style scoped lang="scss">
.section-box{
    position: relative;
    // position: absolute;
    // bottom: 0;
    // left: 0;
    // height: calc(40% - 10px);
    width: 100%;
}
.section-box-tab{
    display: flex;
    align-items: center;
    span{
        padding: 0 20px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        cursor: pointer;
        &.active{
            border-bottom: 5px solid #358acd;
        }
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
.more{
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    border: none;
    outline: none;
    width: 60px;
    height: 20px;
    line-height: 20px;
    background: #358acd;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    border-radius: 3px;
}
.xTable2{
    width: 2400px;
}
.single-search{
    position: relative;
    width: 100%;
    overflow-y: auto;
}
</style>

