<template>
    <div class="volume-edit-wrap" :class="{read: read}" @keyup.stop="">
        <div class="head-box">
            <h3 class="title">查看谱目</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </div>
        <div class="content-box">
            <div class="input-wrap">
                <div class="input-box">
                    <label class="label" for="">家谱谱名</label>
                    <el-input class="w90" v-model="parameter['genealogyName']" :disabled="read"></el-input>
                </div>
                <div class="input-box">
                    <label class="label" for="">谱籍_现代地名</label>
                    <el-input class="w90" v-model="parameter['place']" :disabled="read"></el-input>
                </div>
                <div class="input-box">
                    <label class="label" for="">所在省市区</label>
                    <el-input class="w90" v-model="parameter['address']" :disabled="read || true"></el-input>
                </div>
                <div class="input-box">
                    <label class="label" for="">谱籍_依谱书所载</label>
                    <el-input class="w90" v-model="parameter['LocalityModern']" :disabled="read"></el-input>
                </div>
            </div>
            <ul class="edit-content">
                <li v-for="(item, index) in argumentsList" :key="index">
                    <span class="label">{{item.fieldMeans}}</span>
                    <el-input class="width200" v-model="parameter[item.fieldName]" :title="parameter[item.fieldName]"  :disabled="item.disabled || read" clearable size="medium"></el-input>
                </li>
            </ul>
            <div class="textarea-wrap">
                <div class="textarea-box">
                    <label class="label" for="">说明[explain]</label>
                    <el-input
                        class="textarea"
                        type="textarea"
                        :rows="3"
                        placeholder=""
                        :disabled="read"
                        v-model="parameter['explain']">
                    </el-input>
                </div>
                <div class="textarea-box">
                    <label class="label" for="">备注[memo]</label>
                    <el-input
                        class="textarea"
                        type="textarea"
                        :rows="3"
                        placeholder=""
                        :disabled="read"
                        v-model="parameter['memo']">
                    </el-input>
                </div>
            </div>
            <div class="more-icon">
                <img class="more" :src="require('../../assets/shoot/open_'+(isMore ? 't' : 'b')+'.svg')" :title="isMore ? '收起' : '展开'" @click="isMore = !isMore" alt="">
                <!-- <i class="more" @click="isMore = !isMore">{{isMore ? '收起' : '展开'}}</i> -->
            </div>
            <ul class="edit-content" v-show="isMore">
                <li v-for="(item, index) in argumentsMoreList" :key="index">
                    <span class="label">{{item.fieldMeans}}</span>
                    <el-input class="width200" v-model="parameter[item.fieldName]" :title="parameter[item.fieldName]"  :disabled="item.disabled || read" clearable size="medium"></el-input>
                </li>
            </ul>
            <div class="foot-box" v-if="!read">
                <el-button size="medium" @click="close">取消</el-button>
                <el-button type="primary" size="medium" @click="saveData">保存</el-button>
            </div>
            <div class="volume-head">
                <div class="head-left">
                    <h3>已有卷册信息</h3>
                </div>
                <div class="head-right">
                    <el-switch
                        v-model="isDrag"
                        inactive-text="调整卷册顺序">
                    </el-switch>
                    <el-button class="marginL10" v-if="(role >= 1 && role <= 3) || orgAdmin == 'admin'" type="primary" size="small" @click="handleEditVolumeProperty">修改卷属性</el-button>
                </div>
            </div>
            <vxe-table
                border
                resizable
                stripe
                keep-source
                show-overflow
                highlight-hover-row
                row-key
                ref="xTable"
                :align="'center'"
                :data="volumeList"
                @checkbox-all="selectAllEvent"
                @checkbox-change="selectChangeEvent">
                <vxe-table-column type="checkbox" width="60"></vxe-table-column>
                <vxe-table-column field="_key" title="卷(册)编号"></vxe-table-column>
                <vxe-table-column field="internalSerialNumber" title="卷序号"></vxe-table-column>
                <vxe-table-column field="volumeNumber" title="卷(册)名"></vxe-table-column>
                <vxe-table-column field="syncPages" title="影像页数"></vxe-table-column>
                <vxe-table-column field="singleOrTwoO" title="单双拍"></vxe-table-column>
                <vxe-table-column field="isLeadImagesO" title="电子谱"></vxe-table-column>
                <vxe-table-column field="takeStatusO" title="状态"></vxe-table-column>
                <vxe-table-column title="功能项" width="140" :cell-render="{name:'AdaiActionButton',attr:{data:[{'label': '影像', 'value': 'lookImages'}, {'label': '记录', 'value': 'lookLog'}]},events:{'lookImages': lookImages, 'lookLog': lookLog}}"></vxe-table-column>
                <vxe-table-column v-if="((role >= 1 && role <= 3) || orgAdmin == 'admin') && isDrag" type="html" title="拖动" field="move" width="60"></vxe-table-column>
            </vxe-table>
        </div>
        <div v-if="isShow == 1" class="volume-property-wrap">
            <div class="volume-property-box">
                <div class="head-wrap">
                    <h3 class="title">批量修改卷册属性(已选择{{selectRecords.length}}卷)</h3>
                </div>
                <div class="content-wrap">
                    <div class="content-box">
                        <label class="label" for="">单双拍:</label>
                        <el-radio-group v-model="singleOrTwo">
                            <el-radio :label="'1'">单页</el-radio>
                            <el-radio :label="'2'">双页</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="content-box">
                        <label class="label" for="">电子谱:</label>
                        <el-radio-group v-model="isLeadImages">
                            <el-radio :label="'1'">是</el-radio>
                            <el-radio :label="'0'">否</el-radio>
                        </el-radio-group>
                    </div>
                </div>
                <div class="foot-wrap">
                    <el-button size="small" @click="isShow = 0">取消</el-button>
                    <el-button type="primary" size="small" @click="handleUpdateGCVolumeProperty">保存</el-button>
                </div>
            </div>
        </div>
        <!-- 记录 -->
        <LogModule v-if="isShow == 2" :id="volumeKey" v-on:close="closeLog" />
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
import LogModule from './logModule.vue';
export default {
    name: "catalogView",
    components: {
        LogModule,  
    },
    props:{
        dataKey: String,
        vid: String,
        read: Boolean,
    },
    data: () => {
        return {
            parameterV2: ['_key', 'volumeNumber', 'internalSerialNumber', 'takePages', 'syncPages', 'takeStatusO', 'passUserName', 'passTimeO', 'creatorName', 'createTimeO'],
            theadV2: ['卷(册)编号', '卷(册)名', '卷序号', '已拍页数', '已同步页数', '状态', '审核人', '审核时间', '创建人', '创建时间'],
            argumentsList: [
                {'fieldMeans': '谱ID', 'fieldName': '_key', 'disabled': true},
                {'fieldMeans': '出版年', 'fieldName': 'publish'},
                {'fieldMeans': '家谱姓氏', 'fieldName': 'surname'},
                {'fieldMeans': '家谱姓氏2', 'fieldName': 'surname2'},
                {'fieldMeans': '家谱姓氏3', 'fieldName': 'surname3'},

                {'fieldMeans': '堂号', 'fieldName': 'hall'},
                {'fieldMeans': '档案名称', 'fieldName': 'Filenames'},
                {'fieldMeans': '卷(册)说明', 'fieldName': 'volume'},
                
                {'fieldMeans': '应拍卷(册)数', 'fieldName': 'hasVolume'},
                {'fieldMeans': '实拍卷(册)数', 'fieldName': 'actualVolumes', 'disabled': true},
                {'fieldMeans': '缺卷(册)说明', 'fieldName': 'lostVolume'},
                
                {'fieldMeans': '一世祖', 'fieldName': 'firstAncestor'},
                {'fieldMeans': '始迁祖', 'fieldName': 'migrationAncestor'},
                {'fieldMeans': '版本类型', 'fieldName': 'version'},

                {'fieldMeans': '作者姓名', 'fieldName': 'authors'},
                {'fieldMeans': '作者职务', 'fieldName': 'authorJob'},
                {'fieldMeans': '谱书类型', 'fieldName': 'type'},
                
                {'fieldMeans': '重复谱书ID', 'fieldName': 'Dupbookid'},
                {'fieldMeans': '审核状态', 'fieldName': 'gcStatus', 'disabled': true},
                {'fieldMeans': '状态', 'fieldName': 'condition', 'disabled': true},
                {'fieldMeans': '编辑完结', 'fieldName': 'GCOver', 'disabled': true},
            ],
            argumentsMoreList: [
                {'fieldMeans': '更新人', 'fieldName': 'updateUserName', 'disabled': true},
                {'fieldMeans': '更新日期', 'fieldName': 'updateTime', 'disabled': true},
                {'fieldMeans': '审核人', 'fieldName': 'passUserName', 'disabled': true},
                {'fieldMeans': '审核日期', 'fieldName': 'passTime', 'disabled': true},
                {'fieldMeans': '认领单位', 'fieldName': 'claimOrgName', 'disabled': true},
                {'fieldMeans': '认领时间', 'fieldName': 'claimTime', 'disabled': true},
                {'fieldMeans': '上传机构', 'fieldName': 'createOrgName', 'disabled': true},
                {'fieldMeans': '上传时间', 'fieldName': 'createTime', 'disabled': true},
            ],
            isMore: false,
            parameter: {},
            detail: {},
            passVolumeListO: '',
            volumeList: [],
            selectRecords: [],
            isShow: 0,
            isLeadImages: '0',
            singleOrTwo: '2',
            isDrag: false,
            volumeKey: '',
        };
    },
    mounted: function(){
        console.log(this.vid);
        let parameter = {};
        this.argumentsList.forEach((ele) => {
            parameter[ele.fieldName] = '';
        });
        this.argumentsMoreList.forEach((ele) => {
            parameter[ele.fieldName] = '';
        });

        this.parameter = parameter;

        this.getGenealogyDetail();
        this.getVolumeList();
    },
    methods:{
        closeLog(){
            this.isShow = 0;
        },
        handleEditVolumeProperty(){
            if(this.selectRecords.length){
                this.isShow = 1;
            }else{
                ADS.message('请勾选卷册！');
            }
        },
        selectAllEvent ({ checked, records }) {
            this.selectRecords = records.map((ele) => {
                return ele._key;
            });
        },
        selectChangeEvent ({ checked, records }) {
            this.selectRecords = records.map((ele) => {
                return ele._key;
            });
        },
        lookImages({row}){
            if(row.takeStatus >= 5){
                window.open('/'+this.pathname+'/cameraImage?vid='+row._key+'&gid='+this.parameter['_key']+'&genealogyName='+this.parameter['genealogyName']+'&isRead=');
            }else{
                ADS.message('暂时无影像！');
            }
        },
        lookLog({row}){
            this.isShow = 2;
            this.volumeKey = row._key;
        },
        close(){
            this.$emit('close', false);
        },
        rowDrop () {
            this.$nextTick(() => {
                let xTable = this.$refs.xTable;
                this.sortable = Sortable.create(xTable.$el.querySelector('.vxe-table tbody'), {
                    handle: '.drag-btn',
                    onEnd: ({ newIndex, oldIndex }) => {
                        let sortArr = [];
                        let currRow = this.volumeList.splice(oldIndex, 1)[0];
                        this.volumeList.splice(newIndex, 0, currRow);
                        this.volumeList.map((item, i)=>{
                            sortArr.push(item._key);
                            item.internalSerialNumber = i+1;
                        });
                        console.log(sortArr);
                        if(sortArr.length){
                            this.internalSerialNumberSort(sortArr);
                        }
                        
                    }
                })
            })
        },
        handleUpdateGCVolumeProperty(){
            this.$confirm('您确认要批量修改已勾选卷册的单双拍、电子谱属性信息？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.updateGCVolumePropertyArray();
            }).catch(() => {});
        },
        async updateGCVolumePropertyArray(){
            let result = await api.patchAxios('v3/review/catalog/updateGCVolumePropertyArray', {
                'catalogKey': this.dataKey, 
                'volumeKeyArray': this.selectRecords,
                'singleOrTwo': this.singleOrTwo,
                'isLeadImages': this.isLeadImages,
                "userKey": this.userId,
                'orgKey': this.role >= 1 && this.role <= 3 ? '' : this.orgId,
                "siteKey": this.stationKey,
            });
            if(result.status == 200){
                ADS.message('批量修改卷册属性成功！', true);
                this.isShow = 0;
                this.$emit('save', true);
                this.getVolumeList();
            }else{
                ADS.message(result.msg);
            }
        },
        async updateGCVolumeProperty(){
            let result = await api.patchAxios('v3/review/catalog/updateGCVolumeProperty', {
                'catalogKey': this.dataKey, 
                'singleOrTwo': this.singleOrTwo,
                'isLeadImages': this.isLeadImages,
                "userKey": this.userId,
                'orgKey': this.role >= 1 && this.role <= 3 ? '' : this.orgId,
                "siteKey": this.stationKey,
            });
            if(result.status == 200){
                ADS.message('批量修改卷册属性成功！', true);
                this.isShow = 0;
                this.$emit('save', true);
                this.getVolumeList();
            }else{
                ADS.message(result.msg);
            }
        },
        async internalSerialNumberSort(volumeSortArray){
            let result = await api.patchAxios('v3/review/catalog/internalSerialNumberSort', {
                'catalogKey': this.dataKey, 
                'volumeSortArray': volumeSortArray,
                "userKey": this.userId,
                'orgKey': this.role >= 1 && this.role <= 3 ? '' : this.orgId,
                "siteKey": this.stationKey,
            });
            if(result.status == 200){
                ADS.message('卷册排序成功！', true);
            }else{
                ADS.message(result.msg);
            }
        },
        async getVolumeList(){
            const result = await api.getAxios('catalog/volumeList?catalogKey='+this.dataKey);
            if(result.status == 200){
                let takeStatusOO = {'1': '待拍摄', '2': '拍摄中', '3': '自检中', '4': '同步中', '5': '微站初审中', '6': '打回中', '7': '完成', '8': '开发票中', '12': '机构审核中', '13': '微站复审', '14': '微站待议'};
                this.volumeList = result.data.map((ele) => {
                    ele.isLeadImagesO = ele.isLeadImages == 1 ? '是' : '否';
                    ele.singleOrTwoO = ele.singleOrTwo == 1 ? '单拍' : ele.singleOrTwo == 2 ? '双拍' : '';
                    ele.move = "<img class='drag-btn' title='拖动' src='"+require('../../assets/cnki/drag.svg')+"' />";
                    ele.takeStatusO = takeStatusOO[ele.takeStatus];
                    ele.passTimeO = ele.passTime ? ADS.getLocalTime(ele.passTime, '-', 1) : '';
                    ele.createTimeO = ele.createTime ? ADS.getLocalTime(ele.createTime, '-', 1) : '';
                    return ele;
                });
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        async getGenealogyDetail(){
            const result = await api.getAxios('catalog/detail?catalogKey='+this.dataKey);
            if(result.status == 200){
                let parameter = {};
                this.argumentsList.forEach((ele) => {
                    if(ele.fieldName == 'claimTime'){
                        parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                    }else if(ele.fieldName == 'createTime'){
                        parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                    }else if(ele.fieldName == 'passTime'){
                        parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                    }else if(ele.fieldName == 'updateTime'){
                        parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                    }else if(ele.fieldName == 'GCOver'){
                        parameter[ele.fieldName] = result.data[ele.fieldName] ? '是' : '否';
                    }else if(ele.fieldName == 'gcStatus'){
                        parameter[ele.fieldName] = this.catalogStatusO[result.data[ele.fieldName]];
                    }else{
                        parameter[ele.fieldName] = result.data[ele.fieldName];
                    }
                });

                this.argumentsMoreList.forEach((ele) => {
                    if(ele.fieldName == 'claimTime'){
                        parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                    }else if(ele.fieldName == 'createTime'){
                        parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                    }else if(ele.fieldName == 'passTime'){
                        parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                    }else if(ele.fieldName == 'updateTime'){
                        parameter[ele.fieldName] = result.data[ele.fieldName] ? ADS.getLocalTime(result.data[ele.fieldName]) : '';
                    }else if(ele.fieldName == 'GCOver'){
                        parameter[ele.fieldName] = result.data[ele.fieldName] ? '是' : '否';
                    }else{
                        parameter[ele.fieldName] = result.data[ele.fieldName];
                    }
                });

                this.parameter = parameter;

                this.parameter['address'] = result.data.prov+result.data.city+result.data.district;
                this.parameter['LocalityModern'] = result.data['LocalityModern'];
                this.parameter['explain'] = result.data['explain'];
                this.parameter['memo'] = result.data['memo'];
                this.parameter['place'] = result.data['place'];
                this.parameter['genealogyName'] = result.data['genealogyName'];
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        saveData(){
            this.editCatalog();
        },
        async editCatalog(){// 编辑谱目
            let dataObj = {};
            this.argumentsList.forEach((ele) => {
                if(!ele.disabled){
                    dataObj[ele.fieldName] = this.parameter[ele.fieldName] || '';
                }
            });

            dataObj['place'] = this.parameter['place'];
            dataObj['genealogyName'] = this.parameter['genealogyName'];
            dataObj['LocalityModern'] = this.parameter['LocalityModern'];
            dataObj['explain'] = this.parameter['explain'];
            dataObj['memo'] = this.parameter['memo'];

            let data = await api.patchAxios('data/edit', {
                'dataKey': this.dataKey,
                'dataObj': dataObj,
                'userKey': this.userId, 
                'siteKey': this.stationKey
            });
            if(data.status == 200){
                this.close();
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
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
            orgId: state => state.nav.orgId,
            catalogStatusO: state => state.nav.catalogStatusO,
        })
    },
    watch:{
        'isDrag': function(nv, ov){
            if(nv){
                if((this.role >= 1 && this.role <= 3) || this.orgAdmin == 'admin'){
                    this.rowDrop();
                }
            }else{

            }
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
    z-index: 100;
    &.read{
        top: 0;
        bottom: 0;
        z-index: 100;
    }
    .head-box{
        position: relative;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        .close{
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            cursor: pointer;
        }
    }
    .content-box{
        position: relative;
        width: 750px;
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
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                .label{
                    width: 80px;
                    text-align: left;
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
.table{
    position: relative;
    width: 100%;
    max-height: 100%;
    text-align: center;
    border: none;
    border-collapse: collapse;
    color: #000;
    border: 1px solid #ddd;
    .thead{
        position: relative;
        width: 100%;
        height: 40px;
        background: #D1D1D1;
        position: sticky;
        top: 0;
        z-index: 2;
        tr{
            th{
                padding: 5px 0;
                min-width: 80px;
                border: 1px solid #ddd;
            }
        }
    }
    .tbody{
        position: relative;
        width: 100%;
        height: calc(100% - 42px);
        font-size: 14px;
        tr{
            &:nth-of-type(even){
                background: #F2F2F2;
            }
            &:hover{
                background: #DBE6CC;
            }
            &.active{
                .qingtime-check-box{
                    background: #358acd;
                }
                color: #358acd;
            }
            td{
                padding: 15px 5px;
                min-width: 80px;
                border: 1px solid #ddd;
                .action{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
    }
    .btn{
        padding: 0 10px;
        width: auto;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        background: #358acd;
        color: #fff;
        outline: none;
        border: none;
        cursor: pointer;
        border-radius: 3px;
        &.disabled{
            background: #ddd;
            cursor: default;
        }
    }
    .marginR10{
        margin: 0 5px;
    }
}
i{
    font-style: normal;
}
.volume-head{
    position: relative;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .head-left{
        display: flex;
        align-items: center;
    }
    .head-right{
        display: flex;
        align-items: center;
    }
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    .textarea-box{
        position: relative;
        width: calc(50% - 10px);
        display: flex;
        align-items: center;
        .label{
            width: 80px;
            text-align: left;
        }
        .textarea{
            width: calc(100% - 80px);
        }
    }
}
.input-wrap{
    position: relative;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    .input-box{
        position: relative;
        width: calc(50% - 5px);
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        .label{
            width: 80px;
            text-align: left;
        }
        .w90{
            width: calc(100% - 80px);
        }
    }
}
.volume-property-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    .volume-property-box{
        padding: 20px;
        border-radius: 5px;
        background: #fff;
        .head-wrap{
            position: relative;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .content-wrap{
            position: relative;
            width: 300px;
            .content-box{
                position: relative;
                display: flex;
                align-items: center;
                .label{
                    display: block;
                    width: 100px;
                    height: 40px;
                    line-height: 40px;
                }
            }
        }
        .foot-wrap{
            height: 40px;
            display: flex;
            justify-content: space-around;
            align-items: center;
        }
    }
}
.more-icon{
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    .more{
        cursor: pointer;
        height: 30px;
    }
}
.marginL10{
    margin-left: 10px;
}
</style>

