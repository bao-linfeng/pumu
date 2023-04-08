<template>
    <div class="search-modal-wrap">
        <div class="head-box">
            <h3 class="search-modal-title">家谱资源</h3>
            <span class="btn" @click="isShow = !isShow">{{isShow ? '收起' : '展开'}}</span>
        </div>
        <div class="search-modal-box" v-show="isShow">
            <div class="search-input-modal" v-for="(item,index) in fieldFilterList" :key="'fieldFilters'+index">
                <input type="text" :placeholder="'请输入'+item.label" v-model.trim="parameters[item.value]" @keyup.enter="handleKeyUp" @blur="changeParameters" />
                <div class="tag_close" v-show="parameters[item.value]" @click="clear(item.value)"><i class="el-icon-close"></i></div>
            </div>
            <div class="search-input-modal">
                <input type="text" :placeholder="'请输入文件标题'" v-model.trim="parameters['fileName']" @keyup.enter="handleKeyUp" @blur="changeParameters" />
                <div class="tag_close" v-show="parameters.fileName" @click="clear('fileName')"><i class="el-icon-close"></i></div>
            </div>
            <el-select v-model="parameters.batchKey" placeholder="请选择批次" class="w15 marginB10">
                <el-option
                    v-for="(item,index) in batchArr"
                    :key="index"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-select v-model="parameters.hasImage" placeholder="请选择影像" class="w15 marginB10">
                <el-option
                    v-for="item in imageList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-date-picker
                class="w15 marginB10"
                v-model="parameters.begYear"
                type="year"
                value-format="yyyy"
                placeholder="版本开始年">
            </el-date-picker>
            <el-date-picker
                class="w15 marginB10"
                v-model="parameters.endYear"
                type="year"
                value-format="yyyy"
                placeholder="版本结束年">
            </el-date-picker>
            <el-select v-if="role >= 1 && role <= 3" v-model="parameters.orgKey" multiple placeholder="请选择机构" class="w15 marginB10">
                <el-option
                    v-for="item in orgList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-select v-model="parameters.condition" multiple placeholder="请选择状态" class="w15 marginB10">
                <el-option
                    v-for="item in conditionList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-select v-model="parameters.NoIndex" placeholder="索引(NoIndex)" class="w15 marginB10">
                <el-option
                    v-for="item in NoIndexList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-date-picker
                v-model="time"
                type="daterange"
                unlink-panels
                start-placeholder="导入开始时间"
                end-placeholder="导入结束时间"
            />
            <el-date-picker
                class="w15 marginB10"
                v-model="parameters.FileStartTimes"
                type="date"
                placeholder="档案开始时间">
            </el-date-picker>
            <el-date-picker
                class="w15 marginB10"
                v-model="parameters.FileEndTimes"
                type="date"
                placeholder="档案结束时间">
            </el-date-picker>
            <div class="w15 marginB10 noPublishAD">
                <el-checkbox v-model="parameters.noPublishAD">无公元年</el-checkbox>
            </div>
            <div class="w15 marginB10 noPublishAD">
                <el-checkbox v-model="parameters.isPublish">无出版时间</el-checkbox>
            </div>
            <div class="w15 marginB10 noPublishAD">
                <el-checkbox v-model="parameters.isPlace">无谱籍地</el-checkbox>
            </div>
            <div class="search-input-modal">
                <input type="text" :placeholder="'作者、谱籍地、始迁祖、一世祖'" v-model.trim="parameters['keyWord']" @keyup.enter="handleKeyUp" @blur="changeParameters" />
                <div class="tag_close" v-show="parameters.keyWord" @click="clear('keyWord')"><i class="el-icon-close"></i></div>
            </div>
            <div class="search-input-modal" v-for="item in (6-((fieldFilterList.length+(role >= 1 && role <= 3 ? 15 : 12))%6 || 6))" :key="'kon'+item"></div>
            <div class="search-input-modal"></div>
        </div>
        <div class="search-modal-box" v-if="!isShow">
            <div class="search-input-modal">
                <input type="text" :placeholder="'谱ID'" v-model.trim="parameters['_key']" @keyup.enter="handleKeyUp" @blur="changeParameters" />
                <div class="tag_close" v-show="parameters._key" @click="clear('_key')"><i class="el-icon-close"></i></div>
            </div>
            <div class="search-input-modal">
                <input type="text" :placeholder="'谱名'" v-model.trim="parameters['genealogyName']" @keyup.enter="handleKeyUp" @blur="changeParameters" />
                <div class="tag_close" v-show="parameters.genealogyName" @click="clear('genealogyName')"><i class="el-icon-close"></i></div>
            </div>
            <div class="search-input-modal">
                <input type="text" :placeholder="'文件标题'" v-model.trim="parameters['fileName']" @keyup.enter="handleKeyUp" @blur="changeParameters" />
                <div class="tag_close" v-show="parameters.fileName" @click="clear('fileName')"><i class="el-icon-close"></i></div>
            </div>
            <div class="search-input-modal">
                <input type="text" :placeholder="'姓氏'" v-model.trim="parameters['surname']" @keyup.enter="handleKeyUp" @blur="changeParameters" />
                <div class="tag_close" v-show="parameters.surname" @click="clear('surname')"><i class="el-icon-close"></i></div>
            </div>
            <div class="search-input-modal">
                <input type="text" :placeholder="'堂号'" v-model.trim="parameters['hall']" @keyup.enter="handleKeyUp" @blur="changeParameters" />
                <div class="tag_close" v-show="parameters.hall" @click="clear('hall')"><i class="el-icon-close"></i></div>
            </div>
            <el-select v-model="parameters.condition" multiple placeholder="谱目状态" class="w15 marginB10">
                <el-option
                    v-for="item in conditionList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-select v-if="role >= 1 && role <= 3" v-model="parameters.orgKey" multiple placeholder="上传机构" class="w15 marginB10">
                <el-option
                    v-for="item in orgList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <div class="search-input-modal">
                <input type="text" :placeholder="'作者、谱籍地、始迁祖、一世祖'" v-model.trim="parameters['keyWord']" @keyup.enter="handleKeyUp" @blur="changeParameters" />
                <div class="tag_close" v-show="parameters.keyWord" @click="clear('keyWord')"><i class="el-icon-close"></i></div>
            </div>
            <div class="search-input-modal" v-for="(item, index) in 4" :key="index"></div>
        </div>
        <div class="search-modal-box">
            <div class="search-input-modal"></div>
            <div class="search-button-modal" @click="getGenealogy">
                <span>搜索</span>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "searchModal",
    props:{
        fieldFilters:{
            type: Array,
        }
    },
    components: {

    },
    data: () => {
        return {
            parameters:{
                batchKey:'',
                creator:'',
                hasImage:2,
                libKey: '',
                equal: 1,
                _key:'',
                orgKey: [],
                begYear: '',
                endYear: '',
                noPublishAD: false,
                NoIndex: '',
                startTime: '',
                endTime: '',
                fileName: '',
                isPublish: '',
                isPlace: '',
                condition: [],
                keyWord: '',
                FileStartTimes: '',
                FileEndTimes: '',
            },
            batchArr: [],
            sourcelist: [],
            userList: [],
            NoIndexList: [
                {'label': '全部索引', 'value': ''},
                {'label': '可索引', 'value': 0},
                {'label': '不可索引', 'value': 1},
            ],
            conditionList: [{'label': '全部状态', 'value': ''}, {'label': 'f', 'value': 'f'}, {'label': 'nf', 'value': 'nf'}, {'label': 'd', 'value': 'd'}, {'label': 'r', 'value': 'r'}, {'label': 'm', 'value': 'm'}],
            imageList: [{'label':'影像资料','value':2},{'label':'有影像','value':1},{'label':'无影像','value':0}],
            libList: [],
            nolibList: [{'label':'等于','value':1},{'label':'不等于','value':0}],
            orgList: [],
            fieldFilterList: [{label:'家谱编码',value:'_key'}],
            time: '',
            isShow: false,
        };
    },
    created:function(){
        this.getBatchList();
        this.getLib();
        this.getOrgList();
    },
    mounted:function(){
        if(this.role >= 1 && this.role <= 3){

        }else{
            this.parameters.orgKey = [this.orgId];
            this.$emit('change-parameters',this.parameters);
        }
        this.initFieldFilter();
    },
    methods:{
        initFieldFilter(){
            let fieldFilterList = [];
            this.fieldFilterList.concat(this.fieldFilters).forEach((ele) => {
                if(['condition', 'volume', 'lostVolume', 'authorJob', 'hasVolume', 'genealogyGroupID'].indexOf(ele.value) > -1){
                    
                }else{
                    fieldFilterList.push(ele);
                }
            });
            this.fieldFilterList = fieldFilterList;
        },
        getOrgList:async function(){
            let data=await api.getAxios('org?siteKey='+this.stationKey+'&name=');
            if(data.status == 200){
                let orgList = [{'label':'全部机构','value':''}];
                data.data.map((item)=>{
                    orgList.push({'label': item.organizationNo,'value': item._key});
                });
                this.orgList = orgList;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getLib:async function(){// 来源
            let data=await api.getAxios('lib?siteKey='+this.stationKey);
            if(data.status == 200){
                let libList = [{'label':'全部来源','value':''}];
                data.data.map((item)=>{
                    libList.push({'label':item.libName,'value':item._key});
                });
                this.libList = libList;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getBatchList:async function(){// 批次号列表
            let data=await api.getAxios('batch/simple?siteKey='+this.stationKey+'&userKey='+this.parameters.creator);
            if(data.status == 200){
                let batchArr = [{'label':'全部批次号','value':''}];
                data.data.map((item)=>{batchArr.push({'label':item.batchID,'value':item._key})});
                this.batchArr = batchArr;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getGenealogy(){
            this.$emit('get-genealogy',this.parameters);
        },
        handleKeyUp(){
            this.$emit('get-genealogy',this.parameters);
        },
        clear(s){
            this.parameters[s] = '';
            this.$emit('change-parameters',this.parameters);
        },
        changeParameters(){
            // console.log(this.parameters);
            this.$emit('change-parameters',this.parameters);
        },
    },
    computed: {
        ...mapState({
            role: state => state.nav.role,
            stationKey: state => state.nav.stationKey,
            stationName: state => state.nav.stationName,
            stationlogo: state => state.nav.stationlogo,
            orgAdmin: state => state.nav.orgAdmin,
            orgId: state => state.nav.orgId,
        })
    },
    watch:{
        'time': function(nv, ov){
            if(nv){
                this.parameters.startTime = new Date(nv[0]).getTime();
                this.parameters.endTime = new Date(nv[1]).getTime();
            }else{
                this.parameters.startTime = '';
                this.parameters.endTime = '';
            }
        },
        'fieldFilters': function(nv, ov){
            this.initFieldFilter();
        },
        'orgAdmin': function(nv ,ov){
            if(this.role >= 1 && this.role <= 3){

            }else{
                this.parameters.orgKey = this.orgId;
                this.$emit('change-parameters',this.parameters);
            }
        },
        'parameters.creator':function(nl,ol){
            console.log(nl);
            this.getBatchList();
        },
        'parameters.batchKey': function(nv, ov){
            console.log(nv);
            this.$emit('change-parameters',this.parameters);
        }
    }
};
</script>

<style scoped lang="scss">
.search-modal-wrap{
    position: relative;
    background: #fff;
    padding:30px 20px 20px 20px;
    margin: 20px;
    width: calc(100% - 80px);
    .search-modal-title{
        font-size: 16px;
        color: #344B5A;
        height: 16px;
        line-height: 16px;
        border-left: 2px solid #4C95FF;
        padding-left: 20px;
    }
    .search-modal-box{
        position: relative;
        margin: 10px auto;
        display: flex;
        justify-content: space-between;
        flex-wrap:wrap;
        .simple-search-wrap{
            position: relative;
            width: 85%;
            display: flex;
            justify-content: space-between;
        }
    }
}
.head-box{
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .btn{
        margin-right: 20px;
        cursor: pointer;
    }
}
.search-input-modal{
    position: relative;
    width: 15%;
    height: 40px;
    line-height: 40px;
    margin-bottom: 10px;
    input{
        width: 100%;
        height: 38px;
        line-height: 38px;
        text-indent: 10px;
        border: none;
        outline: none;
        background: #F6FAFD;
        border: 1px solid #D6E7F3;
    }
    .tag_close{
        position: absolute;
        top: 12px;
        right: 10px;
        width: 16px;
        height: 16px;
        line-height: 16px;
        font-size: 12px;
        text-align: center;
        color: #fff;
        background: #4C95FF;
        cursor: pointer;
    }
}
.search-button-modal{
    width: 15%;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: #fff;
    background: #4C95FF;
    border: none;
    outline: none;
    border-radius: 20px;
    cursor: pointer;
    margin: 0;
}
.w15{
    width: 15% !important;
}
.marginB10{
    margin-bottom: 10px;
}
.noPublishAD{
    height: 40px;
    line-height: 40px;
    display: flex;
    align-items: center;
}
</style>

