<template>
    <div class="edit-genealogy-wrap">
        <div class="edit-genealogy-box" :class="{active: isShow}">
            <div class="edit-genealogy-title">
                <h3>{{isShow ? '查看' : '编辑'}}谱目{{gid}}</h3>
                <i class="vxe-icon--close" @click="close(false)"></i>
            </div>
            <ul class="edit-genealogy-ul style1">
                <li v-for="(item,index) in fields" :key="'input'+index">
                    <label>{{item.fieldMeans}}</label>
                    <input type="text" v-model="fieldO[item.fieldName]" :disabled="item.disabled" :placeholder="'请输入'+item.fieldMeans" />
                </li>
            </ul>
            <div class="edit-genealogy-btn" v-if="!isShow">
                <button @click="addPuMu">提交</button>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from '../../ADS.js';
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "editGenealogyModal",
    props:{
        gid:{
            type: String
        },
        pumu:{
            type: Object
        },
        isShow: {
            type: Boolean,
            default: false
        },
    },
    components: {

    },
    data: () => {
        return {
            fields:[],
            fieldO:{},
        };
    },
    mounted:function(){
        this.initField();
    },
    methods:{
        initField(){
            let fieldO = {}, 
            fields = [
                {'fieldMeans': '谱籍_依谱书所载', 'fieldName': 'LocalityModern'},
                {'fieldMeans': '家谱姓氏', 'fieldName': 'surname'},
                {'fieldMeans': '家谱题名', 'fieldName': 'genealogyName'},
                {'fieldMeans': '出版年', 'fieldName': 'publish'},
                {'fieldMeans': '卷数', 'fieldName': 'volume'},
                {'fieldMeans': '堂号', 'fieldName': 'hall'},
                {'fieldMeans': '作者姓名', 'fieldName': 'authors'},
                {'fieldMeans': '实拍册数', 'fieldName': 'hasVolume'},
                {'fieldMeans': '缺卷', 'fieldName': 'lostVolume'},
                {'fieldMeans': '谱籍_现代地名', 'fieldName': 'place'},
                {'fieldMeans': '谱书编号', 'fieldName': 'bookId'},
                {'fieldMeans': 'DGS 号码', 'fieldName': 'DGS'},
                {'fieldMeans': '微卷编号', 'fieldName': 'film'},
                {'fieldMeans': '家谱群组ID', 'fieldName': 'genealogyGroupID'},
                {'fieldMeans': '项目ID', 'fieldName': 'Projectid'},
                {'fieldMeans': '拍摄日期', 'fieldName': 'capturedate', 'disabled': true},
                {'fieldMeans': 'Media号码', 'fieldName': 'Media'},
                {'fieldMeans': '版本类型', 'fieldName': 'version'},
                {'fieldMeans': '作者职务', 'fieldName': 'authorJob'},
                {'fieldMeans': '一世祖', 'fieldName': 'firstAncestor'},
                {'fieldMeans': '始迁祖', 'fieldName': 'migrationAncestor'},
                {'fieldMeans': '备注', 'fieldName': 'memo'},
                {'fieldMeans': '重复项目ID', 'fieldName': 'DupProjectID'},
                {'fieldMeans': '重复谱书编号', 'fieldName': 'Dupbookid'},
                {'fieldMeans': '档案时间', 'fieldName': 'Filetimes', 'disabled': true},
                {'fieldMeans': '档名', 'fieldName': 'Filenames', 'disabled': true},
                {'fieldMeans': '代号', 'fieldName': 'code', 'disabled': true},
                {'fieldMeans': '序号', 'fieldName': 'VolumeFst'},
                {'fieldMeans': '状态', 'fieldName': 'condition', 'disabled': this.role >= 1 && this.role <= 3 ? false : true},
                {'fieldMeans': '说明', 'fieldName': 'explain'},
                {'fieldMeans': '认领单位', 'fieldName': 'claim', 'disabled': true},
                {'fieldMeans': '认领日期', 'fieldName': 'claimDate', 'disabled': true},
                {'fieldMeans': '拍摄期限', 'fieldName': 'shootingPeriod', 'disabled': true},
                {'fieldMeans': '前次认领单位1', 'fieldName': 'pervious1', 'disabled': true},
                {'fieldMeans': '前次认领日期1', 'fieldName': 'perviousDate1', 'disabled': true},
                {'fieldMeans': '前次认领单位2', 'fieldName': 'pervious2', 'disabled': true},
                {'fieldMeans': '前次认领日期2', 'fieldName': 'perviousDate2', 'disabled': true},
                {'fieldMeans': '前次认领单位3', 'fieldName': 'pervious3', 'disabled': true},
                {'fieldMeans': '前次认领日期3', 'fieldName': 'perviousDate3', 'disabled': true}
            ];

            fields.forEach((ele) => {
                if(['claimDate', 'shootingPeriod'].indexOf(ele.fieldName) > -1){
                    fieldO[ele.fieldName] = this.pumu[ele.fieldName] ? ADS.getLocalTime(this.pumu[ele.fieldName]) : '';
                }else{
                    fieldO[ele.fieldName] = this.pumu[ele.fieldName];
                }
            });
            this.fieldO = fieldO;
            this.fields = fields;
        },
        close(flag){
            this.$emit('close-edit',flag);
        },
        async addPuMu(){// 编辑谱目
            this.loading = true;
            let fieldO = {};
            this.fields.forEach((ele) => {
                if(ele.disabled){

                }else{
                    fieldO[ele.fieldName] = this.fieldO[ele.fieldName] || '';
                }
            });
        
            let data = await api.patchAxios('data/edit',{'dataKey': this.gid, 'dataObj': fieldO, 'userKey': this.userId, siteKey: this.stationKey});
            this.loading = false;
            if(data.status == 200){
                this.close(true);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
    },
    computed: {
        ...mapState({
            stationName: state => state.nav.stationName,
            stationlogo: state => state.nav.stationlogo,
            userId: state => state.nav.userId,
            role: state => state.nav.role,
            stationKey: state => state.nav.stationKey,
        })
    },
};
</script>

<style scoped lang="scss">
.style1::-webkit-scrollbar-track{
	border-radius: 2px;
	background-color: #fff;
}
.style1::-webkit-scrollbar{
	width: 4px;
	background-color: #fff;
}
.style1::-webkit-scrollbar-thumb{
	border-radius: 2px;
	background: #358acd;
}
.style1::-webkit-scrollbar-corner{
	background-color: #fff;
}
.edit-genealogy-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.3);
    z-index: 100000;
    display: flex;
    justify-content: center;
    align-items: center;
    .edit-genealogy-box{
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        height: calc(100% - 80px);
        display: inline-block;
        &.active{
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
        }
    }
}
.edit-genealogy-title{
    position: relative;
    text-align: center;
    // margin-bottom: 20px;
    i{
        position: absolute;
        top: 5px;
        right: 0;
        cursor: pointer;
    }
}
.edit-genealogy-ul{
    position: relative;
    height: calc(100% - 80px);
    overflow-y: auto;
    overflow-x: hidden;
    width: 900px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-right: 5px;
    padding-bottom: 20px;
    li{
        // width: 100%;
        display: flex;
        align-items: center;
        margin-top: 15px;
        label{
            height: 40px;
            line-height: 40px;
            width: 120px;
            text-align: right;
            padding-right: 20px;
        }
        input{
            width: 300px;
            height: 40px;
            line-height: 40px;
            line-height: 1;
            border: 1px solid #ddd;
            outline: none;
            text-indent: 10px;
        }
    }
}
.edit-genealogy-btn{
    display: flex;
    justify-content: center;
    button{
        border: none;
        outline: none;
        width: 200px;
        height: 40px;
        line-height: 40px;
        border-radius: 3px;
        background-color: #358acd;
        color: #fff;
        text-align: center;
        cursor: pointer;
    }
}
</style>

