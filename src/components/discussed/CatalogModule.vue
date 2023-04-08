<template>
    <div class="catalog-wrap">
        <div class="catalog-box">
            <div class="head-box">
                <h3 class="title">谱目详情</h3>
                <img class="close" @click="close(false)" src="../../assets/close.svg" alt="">
            </div>
            <div class="content-box style1" :style="{height: (h - 160)+'px'}">
                <div class="input-box" v-for="(item, index) in argumentsList" :key="index">
                    <label class="label">{{item.fieldMeans}}</label>
                    <el-input class="width200 marginL10" v-model="parameter[item.fieldName]" :placeholder="'请输入'+item.fieldMeans"  :disabled="item.disabled" clearable size="medium"></el-input>
                </div>
            </div>
            <div class="foot-box">
                <el-button size="medium" @click="close(false)">取消</el-button>
                <el-button type="primary" size="medium" @click="saveData">保存</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "catalogModule",
    props:{
        gid:{
            type: String
        },
    },
    components: {

    },
    data: () => {
        return {
            argumentsList: [
                {'fieldMeans': '家谱姓氏', 'fieldName': 'surname'},
                {'fieldMeans': '谱编号', 'fieldName': '_key', 'disabled': true},
                {'fieldMeans': '家谱谱名', 'fieldName': 'genealogyName'},
                {'fieldMeans': '出版年', 'fieldName': 'publish'},
                {'fieldMeans': '卷数', 'fieldName': 'volume'},
                {'fieldMeans': '作者姓名', 'fieldName': 'authors'},
                {'fieldMeans': '谱籍_现代地名', 'fieldName': 'place'},
                {'fieldMeans': '堂号', 'fieldName': 'hall'},
                {'fieldMeans': '文件标题', 'fieldName': 'fileName', 'disabled': true},
                {'fieldMeans': '实拍册数', 'fieldName': 'hasVolume'},
                {'fieldMeans': '缺卷', 'fieldName': 'lostVolume'},
                {'fieldMeans': '版本类型', 'fieldName': 'version'},
                {'fieldMeans': '作者职务', 'fieldName': 'authorJob'},
                {'fieldMeans': '一世祖', 'fieldName': 'firstAncestor'},
                {'fieldMeans': '始迁祖', 'fieldName': 'migrationAncestor'},
                {'fieldMeans': '备注', 'fieldName': 'memo'},
                {'fieldMeans': '状态', 'fieldName': 'condition', 'disabled': true},
                {'fieldMeans': '省市区', 'fieldName': 'address', 'disabled': true},
                {'fieldMeans': '审核状态', 'fieldName': 'gcStatus', 'disabled': true},
                {'fieldMeans': '审核人', 'fieldName': 'passUserName', 'disabled': true},
                {'fieldMeans': '审核日期', 'fieldName': 'passTime', 'disabled': true},
                {'fieldMeans': '认领单位', 'fieldName': 'claimOrgName', 'disabled': true},
                {'fieldMeans': '认领日期', 'fieldName': 'claimTime', 'disabled': true},
                {'fieldMeans': '上传机构', 'fieldName': 'createOrgName', 'disabled': true},
                {'fieldMeans': '上传时间', 'fieldName': 'createTime', 'disabled': true}
            ],
            parameter: {},
            h: window.innerHeight || 500,
        };
    },
    mounted:function(){
        let parameter = {};
        this.argumentsList.forEach((ele) => {
            parameter[ele.fieldName] = '';
        });
        this.parameter = parameter;
        this.getGenealogyDetail();
    },
    methods:{
        close(flag){
            this.$emit('close', flag);
        },
        async getGenealogyDetail(){
            const result = await api.getAxios('catalog/detail?catalogKey='+this.gid);
            if(result.status == 200){
                let parameter = {};
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
                            parameter[ele.fieldName] = result.data[ele.fieldName];
                        }
                    }
                });
                this.parameter = parameter;
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
            this.loading = true;
            let data = await api.patchAxios('data/edit',{'dataKey': this.gid,'dataObj': dataObj,'userKey': this.userId, siteKey: this.stationKey});
            this.loading = false;
            if(data.status == 200){
                this.close(true);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        saveData(){
            this.$confirm('请确认所填信息是否正确?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.addPuMu();
            }).catch(() => {});
        },
    },
    computed: {
        ...mapState({
            stationName: state => state.nav.stationName,
            stationlogo: state => state.nav.stationlogo,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
        })
    },
};
</script>

<style scoped lang="scss">
.catalog-wrap{
    // position: fixed;
    // top: 0;
    // right: 0;
    // bottom: 0;
    // left: 0;
    // background: rgba(0,0,0,0.3);
    // display: flex;
    // justify-content: center;
    // align-items: center;
    z-index: 100;
    .catalog-box{
        position: relative;
        // width: calc(100% - 140px);
        // height: calc(100% - 50px);
        padding: 0 20px;
        background: #fff;
        border-radius: 5px;
        .head-box{
            position: relative;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            .close{
                position: absolute;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                cursor: pointer;
            }
        }
    }
    .content-box{
        position: relative;
        width: 650px;
        height: 400px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        overflow-y: auto;
        .input-box{
            position: relative;
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            .label{
                width: 100px;
            }
        }
    }
    .foot-box{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 60px;
    }
}
.width200{
    width: 200px;
}
.marginL10{
    margin-right: 10px;
}
</style>

