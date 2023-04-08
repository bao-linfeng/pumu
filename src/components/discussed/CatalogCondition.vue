<template>
    <div class="over-time-wrap">
        <div class="over-time-box">
            <div class="head-box">
                <h3 class="title">批量修改</h3>
            </div>
            <div class="content-box">
                <p class="red">(提示:你正在进行批量谱状态修改.)</p>
                <p class="content">当前选中 {{list.length}}条数据, 请选择更改后的谱状态:</p>
                <el-select class="width150 marginR10" v-model="condition" placeholder="谱目状态调整" size="small">
                    <el-option
                        v-for="item in conditionList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <div class="input-box">
                    <label class="label">请输入以下字符"pipeline" 以便确认:</label>
                    <input class="input" v-model="name" type="text" placeholder="" />
                </div>
            </div>
            <div class="foot-box">
                <el-button size="medium" @click="close(false)">取消</el-button>
                <el-button type="primary" size="medium" @click="saveData">确认</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "catalogCondition",
    props:{
        dataKey: String,
        list: Array,
    },
    data: () => {
        return {
            name: '',
            condition: '',
            gcStatus: '',
            conditionList: [{'label': 'd|重复谱', 'value': 'd'}, {'label': 'r|无效谱', 'value': 'r'}, {'label': 'nf|审核通过', 'value': 'nf'}],
        };
    },
    mounted: function(){
        
    },
    methods:{
        close(f = true){
            this.$emit('close', f);
        },
        saveData(){
            if(this.name == 'pipeline'){
                this.$confirm('确认批量设置谱状态吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.patchOverTimeBatch();
                }).catch(() => {});
            }else{
                this.$XModal.message({ message: '请输入pipeline确认', status: 'warning' })
            }
        },
        async patchOverTimeBatch(){// 批量处理逾期谱
            let data = await api.patchAxios('v3/review/catalog/statusBatch',{'catalogKeyArray': this.list, 'gcStatus': this.gcStatus, 'condition': this.condition, 'siteKey': this.stationKey, 'userKey': this.userId});
            if(data.status == 200){
                this.$XModal.message({ message: '批处理谱状态成功', status: 'success' })
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
        })
    },
    watch:{
        'condition': function(nv, ov){
            if(nv == 'd'){
                this.gcStatus = '15';
            }else if(nv == 'r'){
                this.gcStatus = '10';
            }else if(nv == 'nf'){
                this.gcStatus = '30';
            }
        },
    }
};
</script>

<style scoped lang="scss">
.over-time-wrap{
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    font-size: 14px;
    color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    .over-time-box{
        position: relative;
        padding: 30px;
        background: #fff;
        border-radius: 5px;
        .head-box{
            position: relative;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .content-box{
            margin: 20px 0;
            .red{
                color: #f00;
            }
            .content{
                text-indent: 20px;
                margin: 30px 0;
            }
            .input-box{
                position: relative;
                display: flex;
                align-items: center;
                .input{
                    border-radius: 3px;
                    border: 1px solid #ddd;
                    text-indent: 10px;
                    width: 100px;
                    height: 30px;
                    line-height: 30px;
                    outline: none;
                    margin-left: 20px;
                }
            }
        }
        .foot-box{
            display: flex;
            justify-content: space-around;
            align-items: center;
        }
    }
}
</style>

