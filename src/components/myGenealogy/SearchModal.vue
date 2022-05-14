<template>
    <div class="search-modal-wrap">
        <h3 class="search-modal-title">家谱资源</h3>
        <div class="search-modal-box">
            <div class="search-input-modal" v-for="(item,index) in [{label:'家谱编码',value:'_key'}].concat(fieldFilters)" :key="'fieldFilters'+index">
                <input type="text" :placeholder="'请输入'+item.label" v-model.trim="parameters[item.value]" @keyup.enter="handleKeyUp" @blur="changeParameters" />
                <div class="tag_close" v-show="parameters[item.value]" @click="clear(item.value)"><i class="el-icon-close"></i></div>
            </div>
            <el-select v-model="parameters.batchKey" placeholder="请选择批次" class="w15 marginB10">
                <el-option
                    v-for="(item,index) in batchArr"
                    :key="index"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-select v-model="parameters.creator" placeholder="请选择上传者" class="w15 marginB10">
                <el-option
                    v-for="item in userList"
                    :key="item._key"
                    :label="item.userName"
                    :value="item._key">
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
            <el-select v-model="parameters.libKey" placeholder="请选择来源" class="w15 marginB10">
                <el-option
                    v-for="item in libList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <el-select v-model="parameters.equal" placeholder="请选择包含关系" class="w15 marginB10">
                <el-option
                    v-for="item in nolibList"
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
            <el-select v-if="role >= 1 && role <= 2" v-model="parameters.orgKey" placeholder="请选择机构" class="w15 marginB10">
                <el-option
                    v-for="item in orgList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
            </el-select>
            <div class="w15 marginB10 noPublishAD">
                <el-checkbox v-model="parameters.noPublishAD">无公元年</el-checkbox>
            </div>
            <div class="search-input-modal" v-for="item in (6-((fieldFilters.length+(role >= 1 && role <= 2 ? 11 : 10))%6 || 6))" :key="'kon'+item"></div>
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
                orgKey: '',
                begYear: '',
                endYear: '',
                noPublishAD: false,
            },
            batchArr: [],
            sourcelist: [],
            userList: [],
            imageList: [{'label':'影像资料','value':2},{'label':'有影像','value':1},{'label':'无影像','value':0}],
            libList: [],
            nolibList: [{'label':'等于','value':1},{'label':'不等于','value':0}],
            orgList: [],
        };
    },
    created:function(){
        this.getBatchList();
        this.getUserList();
        this.getLib();
        this.role >= 1 && this.role <= 2 ? this.getOrgList() : null;
    },
    mounted:function(){
        
    },
    methods:{
        getOrgList:async function(){
            let data=await api.getAxios('org?siteKey='+this.stationKey+'&name=');
            if(data.status == 200){
                let orgList = [{'label':'全部','value':''}];
                data.data.map((item)=>{
                    orgList.push({'label': item.name,'value': item._key});
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
        getUserList:async function(){// 用户列表
            let data=await api.getAxios('user?userName=&page=1&limit=1000');
            if(data.status && data.result){
                let userList = data.result.list;
                this.userList = [{'_key':'','userName':'全部创建者'}].concat(userList);
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
        })
    },
    watch:{
        'parameters.creator':function(nl,ol){
            console.log(nl);
            this.getBatchList();
        },
        'parameters.batchKey': function(nv, ov){
            console.log(nv);
            this.$emit('change-parameters',this.parameters);
        }
        // 'parameters': function(nv, ov){
        //     console.log(nv);
        //     this.$emit('change-parameters',this.parameters);
        // },
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
        position: absolute;
        top: 10px;
        left: 0;
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

