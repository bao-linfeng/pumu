<template>
    <div class="volume-edit-wrap" @keyup.stop="" :class="{read: read}">
        <div class="head-box">
            <el-button type="primary" size="small" @click="handleOpenAutoCompleteSearch">地址搜索</el-button>
            <h3 class="title">谱目编辑</h3>
            <img class="close" @click="close(false)" src="../../assets/close.svg" alt="">
        </div>
        <div class="content-box">
            <ul class="edit-content">
                <li v-for="(item, index) in argumentsList" :key="index">
                    <span class="label">{{item.fieldMeans}}</span>
                    <el-input class="w90" :class="{changeActive: changeFieldArr.indexOf(item.fieldName) > -1}" v-model="parameter[item.fieldName]" :title="parameter[item.fieldName]"  :disabled="item.disabled || read" clearable size="medium"></el-input>
                </li>
            </ul>
            <div class="textarea-wrap">
                <div class="textarea-box">
                    <label class="label" for="">谱目状态</label>
                    <el-select class="width100" v-model="condition" placeholder="谱目状态">
                        <el-option
                            v-for="item in conditionList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </div>
                <div class="textarea-box">
                    <label class="label" for="">备注[memo]</label>
                    <el-input
                        class="textarea"
                        :class="{changeActive: changeFieldArr.indexOf('memo') > -1}"
                        type="textarea"
                        :rows="3"
                        placeholder=""
                        :disabled="read"
                        v-model="parameter['memo']">
                    </el-input>
                </div>
                <div class="textarea-box">
                    <label class="label" for="">说明[explain]</label>
                    <el-input
                        class="textarea"
                        :class="{changeActive: changeFieldArr.indexOf('explain') > -1}"
                        type="textarea"
                        :rows="3"
                        placeholder=""
                        :disabled="read"
                        v-model="parameter['explain']">
                    </el-input>
                </div>
                <div class="textarea-box">
                    <label class="label" for="">谱目编辑</label>
                    <el-radio-group v-model="GCOver" :disabled="read">
                        <el-radio :label="'1'">已完结</el-radio>
                        <el-radio :label="''">未完结</el-radio>
                    </el-radio-group>
                </div>
                <div class="textarea-box">
                    <label class="label" for="">索引(index)</label>
                    <el-radio-group v-model="NoIndex" :disabled="read">
                        <el-radio :label="0">可索引</el-radio>
                        <el-radio :label="1">不可索引</el-radio>
                    </el-radio-group>
                </div>
            </div>
            <div class="foot-box" v-if="!read">
                <el-button size="medium" @click="close">取消</el-button>
                <el-button type="primary" size="medium" @click="saveData">保存</el-button>
            </div>
        </div>
        <AutoCompleteSearch v-if="isOpen" v-on:close="isOpen = 0" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
import AutoCompleteSearch from './AutoCompleteSearch.vue';
export default {
    name: "catalogView",
    components: {
        AutoCompleteSearch, 
    },
    props:{
        dataKey: String,
        vid: String,
        read: Boolean,
        attr: {
            type: Array,
            default: [],
        }
    },
    data: () => {
        return {
            argumentsList: [
                // {'fieldMeans': '谱ID', 'fieldName': '_key', 'disabled': true},
                {'fieldMeans': '家谱谱名', 'fieldName': 'genealogyName'},
                {'fieldMeans': '谱籍_现代地名', 'fieldName': 'place'},
                {'fieldMeans': '缺卷(册)说明', 'fieldName': 'lostVolume'},
                {'fieldMeans': '谱籍_依谱书所载', 'fieldName': 'LocalityModern'},
                {'fieldMeans': '家谱姓氏', 'fieldName': 'surname'},
                {'fieldMeans': '家谱姓氏2', 'fieldName': 'surname2'},
                {'fieldMeans': '家谱姓氏3', 'fieldName': 'surname3'},
                {'fieldMeans': '出版年', 'fieldName': 'publish'},
                {'fieldMeans': '卷(册)说明', 'fieldName': 'volume'},
                {'fieldMeans': '堂号', 'fieldName': 'hall'},
                {'fieldMeans': '作者姓名', 'fieldName': 'authors'},
                {'fieldMeans': '应拍卷(册)数', 'fieldName': 'hasVolume'},
                {'fieldMeans': '作者职务', 'fieldName': 'authorJob'},
                // {'fieldMeans': '起年', 'fieldName': 'startYear'},
                {'fieldMeans': '一世祖', 'fieldName': 'firstAncestor'},
                {'fieldMeans': '始迁祖', 'fieldName': 'migrationAncestor'},
                {'fieldMeans': '重复ID', 'fieldName': 'Dupbookid'},
                // {'fieldMeans': '说明', 'fieldName': 'explain'},
                // {'fieldMeans': '备注', 'fieldName': 'memo'},
                // {'fieldMeans': '状态', 'fieldName': 'condition', 'disabled': true},
                // {'fieldMeans': '上传机构', 'fieldName': 'createOrgName', 'disabled': true},
                // {'fieldMeans': '上传时间', 'fieldName': 'createTime', 'disabled': true},
                // {'fieldMeans': '审核人', 'fieldName': 'passUserName', 'disabled': true},
                // {'fieldMeans': '审核日期', 'fieldName': 'passTime', 'disabled': true}
            ],
            GCOver: '',
            NoIndex: 0,
            parameter: {},
            detail: {},
            passVolumeListO: '',
            volumeList: [],
            changeFieldArr: [],
            GCOverList: [
                {'label': '未完结', 'value': ''},
                {'label': '已完结', 'value': '1'}
            ],
            conditionList: [
                {'label': 'f', 'value': 'f'},
                {'label': 'nf', 'value': 'nf'},
                {'label': 'm', 'value': 'm'},
                {'label': 'r', 'value': 'r'},
                {'label': 'd', 'value': 'd'},
            ],
            condition: '',
            parameterV2: ['_key', 'volumeNumber', 'internalSerialNumber', 'takePages', 'syncPages', 'takeStatusO', 'passUserName', 'passTimeO', 'creatorName', 'createTimeO'],
            theadV2: ['卷(册)编号', '卷(册)名', '卷序号', '已拍页数', '已同步页数', '状态', '审核人', '审核时间', '创建人', '创建时间'],
            isOpen: 0,
        };
    },
    mounted: function(){
        console.log(this.vid);
        let parameter = {};

        if(this.attr && this.attr.length){
            this.attr.forEach((ele, i) => {
                if(['condition'].indexOf(ele.fieldName) > -1){
                    // parameter[ele.fieldName] = '';
                }else{
                    this.argumentsList.push(ele);
                }
            });
        }
        
        this.argumentsList.forEach((ele) => {
            parameter[ele.fieldName] = '';
        });
        this.parameter = parameter;

        this.getGenealogyDetail();
    },
    methods:{
        handleOpenAutoCompleteSearch(){
            this.isOpen = 1;
        },
        close(f = false){
            this.$emit('close', f);
        },
        async getGenealogyDetail(){
            const result = await api.getAxios('catalog/detail?catalogKey='+this.dataKey);
            if(result.status == 200){
                let parameter = {};
                this.changeFieldArr = result.data.changeFieldArr || [];
                this.argumentsList.forEach((ele) => {
                    if(ele.fieldName == 'address'){
                        parameter[ele.fieldName] = result.data.prov+result.data.city+result.data.district;
                    }else{
                        if(ele.fieldName == 'claimTime'){
                            parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                        }else if(ele.fieldName == 'createTime'){
                            parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                        }else if(ele.fieldName == 'passTime'){
                            parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                        }else{
                            parameter[ele.fieldName] = result.data[ele.fieldName] || '';
                        }
                    }
                });

                this.parameter = parameter;

                this.parameter['explain'] = result.data['explain'] || '';
                this.parameter['memo'] = result.data['memo'] || '';
                this.condition = result.data['condition'] || '';
                // this.parameter['condition'] = result.data['condition'] || '';
                this.GCOver = result.data.GCOver ? '1' : '';
                this.NoIndex = result.data.NoIndex ? 1 : 0;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async addPuMu(){// 编辑谱目
            let dataObj = {};
            this.argumentsList.forEach((ele) => {
                if(!ele.disabled){
                    dataObj[ele.fieldName] = this.parameter[ele.fieldName] || '';
                }
            });
            dataObj['explain'] = this.parameter['explain'];
            dataObj['memo'] = this.parameter['memo'];
            // dataObj['condition'] = this.parameter['condition'];
            dataObj['condition'] = this.condition;
            dataObj['GCOver'] = this.GCOver;
            dataObj['NoIndex'] = this.NoIndex ? 1 : 0;
            let data = await api.patchAxios('data/edit',{'dataKey': this.dataKey,'dataObj': dataObj,'userKey': this.userId, siteKey: this.stationKey});
            if(data.status == 200){
                this.close(true);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        saveData(){
            this.addPuMu();
            // this.$confirm('请确认所填信息是否正确?', '提示', {
            //     confirmButtonText: '确定',
            //     cancelButtonText: '取消',
            //     type: 'warning'
            // }).then(() => {
            //     this.addPuMu();
            // }).catch(() => {});
        },
    },
    computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userName: state => state.nav.userName,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
            role: state => state.nav.role,
            pathname: state => state.nav.pathname,
            orgAdmin: state => state.nav.orgAdmin,
        })
    },
    watch:{
        'condition': function(nv, ov){
            console.log(nv);
        },
    }
};
</script>

<style scoped lang="scss">
.volume-edit-wrap{
    position: fixed;
    top: 40px;
    bottom: 100px;
    right: 0;
    background: #fff;
    font-size: 14px;
    color: #000;
    padding: 0 20px 20px 20px;
    box-shadow: 0 0 1px 1px #ddd;
    z-index: 1000;
    &.read{
        top: 0;
        bottom: 0;
        z-index: 100;
    }
    .head-box{
        position: relative;
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .close{
            // position: absolute;
            // top: 50%;
            // right: 0;
            // transform: translateY(-50%);
            cursor: pointer;
        }
    }
    .content-box{
        position: relative;
        width: 400px;
        height: calc(100% - 50px);
        overflow: auto;
        .edit-content{
            position: relative;
            // height: 100%;
            overflow-y: auto;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: 100%;
            li{
                position: relative;
                width: 100%;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                .label{
                    width: 100px;
                    text-align: left;
                    display: block;
                }
            }
        }
        .foot-box{
            position: relative;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
.width200{
    width: 150px;
}
.marginL10{
    margin-right: 10px;
}
i{
    font-style: normal;
}
.volume-head{
    position: relative;
    text-align: left;
}
.volume-table{
    position: relative;
    width: 730px;
    height: 200px;
    overflow: auto;
}
.textarea-wrap{
    position: relative;
    width: 100%;
    // display: flex;
    // justify-content: space-between;
    // align-items: center;
    // margin-bottom: 10px;
    .textarea-box{
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        .label{
            width: 100px;
            text-align: left;
        }
        .textarea{
            width: calc(100% - 100px);
            font-size: 16px;
        }
    }
}
.input-wrap{
    position: relative;
    width: 100%;
    .input-box{
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        text-align: left;
        .label{
            width: 100px;
            text-align: left;
        }
    }
}
.w90{
    position: relative;
    width: calc(100% - 100px);
    font-size: 16px;
}
.width80{
    width: 100px;
}
</style>

