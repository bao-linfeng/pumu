<template>
    <div class="volume-edit-wrap" @keyup.stop="" :class="{read: read}">
        <div class="head-box">
            <el-button type="primary" size="small" @click="handleOpenAutoCompleteSearch">地名搜索</el-button>
            <h3 class="title">谱目编辑</h3>
            <img class="close" @click="close(false)" src="../../assets/close.svg" alt="">
        </div>
        <div class="content-box">
            <ul class="edit-content">
                <li v-for="(item, index) in argumentsList" :key="index" v-show="!item.hide">
                    <span class="label"><i>{{item.fieldMeans}}</i><img class="title" v-if="item.rule" :title="item.rule" src="../../assets/help.svg" /></span>
                    <el-input class="w90" :class="{red: item.required && !parameter[item.fieldName], changeActive: changeFieldArr.indexOf(item.fieldName) > -1, w80: ['place'].indexOf(item.fieldName) > -1}" v-model="parameter[item.fieldName]" :title="parameter[item.fieldName]"  :disabled="item.disabled || read" clearable size="medium"></el-input>
                    <img class="edit" v-if="['place'].indexOf(item.fieldName) > -1 && isEdit" @click="isOpen = 2" title="更新" src="../../assets/shoot/leaveMsg.svg" alt="">
                </li>
            </ul>
            <div class="textarea-wrap">
                <div class="textarea-box">
                    <label class="label" for=""><i>备注[memo]</i><img class="title" title="必須要半型的標點符號" src="../../assets/help.svg" /></label>
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
                    <label class="label" for="">谱目状态</label>
                    <el-select class="width100" v-model="parameter['condition']" :disabled="true" placeholder="谱目状态">
                        <el-option
                            v-for="item in conditionList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                    <img class="edit" v-if="role >= 1 && role <= 3 && isEdit" @click="isOpen = 3" title="更新状态" src="../../assets/shoot/leaveMsg.svg" alt="">
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
        </div>
        <div class="foot-box" v-if="!read && isEdit">
            <el-button size="medium" @click="close">取消</el-button>
            <el-button type="primary" size="medium" @click="saveData">保存</el-button>
        </div>
        <!-- 谱籍地(现代)修改 -->
        <PlaceModule v-if="isOpen == 2" :address="parameter" v-on:close="isOpen = 0" v-on:save="savePlace" />
        <!-- 状态修改 -->
        <ConditionEdit v-if="isOpen == 3" :catalog="detail" v-on:close="isOpen = 0" v-on:save="saveCondition" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
import PlaceModule from './PlaceModule.vue';
import ConditionEdit from './ConditionEdit.vue';
export default {
    name: "catalogView",
    components: {
        PlaceModule, ConditionEdit, 
    },
    props:{
        dataKey: String,
        vid: String,
        read: Boolean,
    },
    data: () => {
        return {
            argumentsList: [
                // {'fieldMeans': '谱ID', 'fieldName': '_key', 'disabled': true},
                {'fieldMeans': '谱名', 'fieldName': 'genealogyName', 'required': true, 'rule': '可以放半型“.“”( )”，不可以有其他標點符號，不可有空格，可拆字（），不可有阿拉伯數字'},
                {'fieldMeans': '姓氏', 'fieldName': 'surname', 'required': true, 'rule': '第1欄不可為空白，第2-3欄可以空白；提供三個欄位，每個欄位只能放一個姓氏，不可加“氏”，最多三個姓氏'},
                {'fieldMeans': '出版年', 'fieldName': 'publish', 'required': true, 'rule': '只能填入阿拉伯數字，不可加“年”'},
                {'fieldMeans': '堂号', 'fieldName': 'hall', 'required': true, 'rule': '不可空白，如無堂號請填“無”'},
                {'fieldMeans': '一世祖', 'fieldName': 'firstAncestor', 'rule': '只能放1個人的完整姓名（姓+名），最後一個字元不可以是公，不可有其他標點符號，除了拆字（）'},
                {'fieldMeans': '始迁祖', 'fieldName': 'migrationAncestor', 'rule': '只能放1個人的完整姓名（姓+名），最後一個字元不可以是公，不可有其他標點符號，除了拆字（）'},
                {'fieldMeans': '谱籍地(原谱)', 'fieldName': 'LocalityModern', 'required': true, 'rule': '不同的行政區劃需用","分開，只能放文字，只能放大寫數字，不可有空格,不可有其他標點符號,除了拆字（）'},
                {'fieldMeans': '谱籍地(现代)', 'fieldName': 'place', 'required': true, 'rule': '只能錄入一個完整地名，含省份，市，縣，鄉/鎮/街道，如果有村可錄入；'},
                {'fieldMeans': '卷(册)说明', 'fieldName': 'volume', 'required': true, 'rule': '依照譜書目錄填入卷（冊）數，可以使用","，不可有空格不分卷全____冊'},
                {'fieldMeans': '缺卷(册)说明', 'fieldName': 'lostVolume', 'required': true, 'rule': '提供錄入選單如下: 選項1：總卷數欄位如為總卷數不詳，填"存卷______________”；選項2：總卷數欄位如為不分卷且確定不全，填"存___冊”；選項3：不缺卷（冊）；選項4：知道總卷數且確定不全，則填“缺。。。”選項5：其他（可自由填入資訊）只可以使用半型“,“~“，數字必須是阿拉伯數字，不可有空格；'},
                {'fieldMeans': '应拍册数', 'fieldName': 'hasVolume', 'required': true, 'rule': '只要填阿拉伯數字，沒有文字'},
                {'fieldMeans': '实拍册数', 'fieldName': 'volumeNumber', 'rule': '只要填阿拉伯數字，沒有文字'},
                {'fieldMeans': '作者', 'fieldName': 'authors', 'required': true, 'rule': '只能放1個人的完整姓名（姓+名），最後一個字元不可以是公，除了拆字（），不可有其他標點符號；可寫不詳'},
                {'fieldMeans': '作者职务', 'fieldName': 'authorJob', 'required': true, 'rule': '只能放1個職務，不可有標點符號；可寫不詳'},
                {'fieldMeans': '重复ID', 'fieldName': 'Dupbookid', 'rule': '只能填譜ID，只要有資料就表示要關聯系統原有譜書ID'},
                {'fieldMeans': '家谱姓氏2', 'fieldName': 'surname2'},
                {'fieldMeans': '家谱姓氏3', 'fieldName': 'surname3'},

                {'fieldMeans': '省', 'fieldName': 'prov', 'hide': true},
                {'fieldMeans': '市', 'fieldName': 'city', 'hide': true},
                {'fieldMeans': '区', 'fieldName': 'district', 'hide': true},
                // {'fieldMeans': '起年', 'fieldName': 'startYear'},
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
            changeFieldArr: [],
            conditionList: [
                {'label': 'f', 'value': 'f'},
                {'label': 'nf', 'value': 'nf'},
                {'label': 'm', 'value': 'm'},
                {'label': 'r', 'value': 'r'},
                {'label': 'd', 'value': 'd'},
            ],
            isOpen: 0,
            isEdit: false,
        };
    },
    mounted: function(){
        console.log(this.vid);
        let parameter = {};
        
        this.argumentsList.forEach((ele) => {
            parameter[ele.fieldName] = '';
        });
        this.parameter = parameter;

        this.getGenealogyDetail();
    },
    methods:{
        saveCondition(data){
            this.parameter['condition'] = data;
            this.isOpen = 0;
        },
        savePlace(data){
            this.isOpen = 0;
            this.parameter['prov'] = data.province;
            this.parameter['city'] = data.city;
            this.parameter['district'] = data.district;
            this.parameter['place'] = data.province+data.city+data.district+data.place;
        },
        handleOpenAutoCompleteSearch(){
            window.open('/'+this.pathname+'/autoCompleteSearch?place='+this.parameter['place']);
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
                    parameter[ele.fieldName] = result.data[ele.fieldName] || '';
                });

                this.parameter = parameter;

                this.parameter['explain'] = result.data['explain'] || '';
                this.parameter['memo'] = result.data['memo'] || '';
                this.parameter['condition'] = result.data['condition'] || '';
                this.GCOver = result.data.GCOver ? '1' : '';
                this.NoIndex = result.data.NoIndex ? 1 : 0;

                this.detail = result.data;

                this.isEdit = true;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async editCatalog(){// 编辑谱目
            let dataObj = {};
            this.argumentsList.forEach((ele) => {
                if(!ele.disabled){
                    dataObj[ele.fieldName] = this.parameter[ele.fieldName] || '';
                }
            });
            dataObj['explain'] = this.parameter['explain'];
            dataObj['memo'] = this.parameter['memo'];
            dataObj['GCOver'] = this.GCOver;
            dataObj['NoIndex'] = this.NoIndex ? 1 : 0;

            let result = await api.patchAxios('data/edit', {
                'dataKey': this.dataKey,
                'dataObj': dataObj,
                'userKey': this.userId, 
                'siteKey': this.stationKey,
            });

            if(result.status == 200){
                this.close(true);
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        saveData(){
            // 必填项判断
            let required = false, fieldMeans = '', 
            publishRegExp = new RegExp(/\D/g), 
            firstAncestorRegExp = new RegExp(/[,./;'\\\[\]!@#\$%\^&*()_=]|[，。、；‘、【】！@#￥%&*——+]/g),
            migrationAncestorRegExp = new RegExp(/[,./;'\\\[\]!@#\$%\^&*()_=]|[，。、；‘、【】！@#￥%&*——+]/g);
            this.argumentsList.forEach((currentValue, index) => {
                if(currentValue.required && !this.parameter[currentValue.fieldName]){
                    required = true;
                    if(!fieldMeans){
                        fieldMeans = currentValue.fieldMeans;
                    }
                }
            });
            if(required){
                return this.$XModal.message({ message: fieldMeans+'必填！'+(fieldMeans == '堂号' ? '无堂号可填 无' : ''), status: 'warning' });
            }
            // 姓氏标错规则
            if(this.parameter['surname'].indexOf('氏') > -1){
                return this.$XModal.message({ message: '姓氏不可添加 氏', status: 'warning' });
            }
            if(this.parameter['surname2'].indexOf('氏') > -1){
                return this.$XModal.message({ message: '姓氏2不可添加 氏', status: 'warning' });
            }
            if(this.parameter['surname3'].indexOf('氏') > -1){
                return this.$XModal.message({ message: '姓氏3不可添加 氏', status: 'warning' });
            }
            // 出版年标错规则
            if(this.parameter['publish'].indexOf('年') > -1){
                return this.$XModal.message({ message: '出版年不可添加 年', status: 'warning' });
            }
            if(publishRegExp.test(this.parameter['publish'])){
                return this.$XModal.message({ message: '出版年必须是数字', status: 'warning' });
            }
            // 一世祖、始迁祖标错规则
            if(this.parameter['firstAncestor'][this.parameter['firstAncestor'].length - 1] == '公'){
                return this.$XModal.message({ message: '一世祖最后一个字不能是 公', status: 'warning' });
            }
            if(firstAncestorRegExp.test(this.parameter['firstAncestor']) && this.parameter['firstAncestor']){
                return this.$XModal.message({ message: '一世祖不可有其他標點符號，除了拆字（）', status: 'warning' });
            }
            if(this.parameter['migrationAncestor'].indexOf('(') > -1 && this.parameter['migrationAncestor'].indexOf(')') > -1){
                return this.$XModal.message({ message: '始迁祖最后一个字不能是 公', status: 'warning' });
            }
            if(migrationAncestorRegExp.test(this.parameter['migrationAncestor']) && this.parameter['migrationAncestor']){
                return this.$XModal.message({ message: '始迁祖祖不可有其他標點符號，除了拆字（）', status: 'warning' });
            }

            // this.editCatalog();
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
    padding: 10px 20px;
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
        width: 820px;
        height: calc(100% - 80px);
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
                width: 50%;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                .label{
                    width: 100px;
                    margin-left: 10px;
                    display: flex;
                    align-items: center;
                    .title{
                        cursor: pointer;
                        height: 15px;
                    }
                }
                .edit{
                    background: #000;
                    margin-left: 10px;
                    cursor: pointer;
                }
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
    text-align: left;
    .textarea-box{
        position: relative;
        width: 50%;
        display: inline-flex;
        align-items: center;
        margin-bottom: 10px;
        .label{
            width: 100px;
            margin-left: 10px;
            display: flex;
            align-items: center;
            .title{
                cursor: pointer;
                height: 15px;
            }
        }
        .textarea{
            width: calc(100% - 100px);
            font-size: 16px;
        }
        .edit{
            background: #000;
            margin-left: 10px;
            cursor: pointer;
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
.w80{
    width: calc(100% - 140px);
}
.width80{
    width: 100px;
}
</style>

