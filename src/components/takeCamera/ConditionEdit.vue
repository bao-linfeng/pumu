<template>
    <div class="condition-wrap" @keyup.stop="">
        <div class="head-box">
            <h3 class="title">{{catalog.genealogyName}}-编辑谱目状态</h3>
            <img class="close" @click="close" src="../../assets/close.svg" alt="">
        </div>
        <div class="content-box">
            <div class="condition-box">
                <label class="label">请选择谱目状态</label>
                <el-select class="w160" v-model="condition" size="mini" placeholder="状态">
                    <el-option
                        v-for="item in conditionList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
        </div>
        <div class="foot-box">
            <el-button size="mini" @click="close">取消</el-button>
            <el-button type="primary" size="mini" @click="saveData">保存</el-button>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import ADS from "../../ADS.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "conditionEdit",
    props:{
        catalog: Object,
    },
    data: () => {
        return {
            conditionList: [
                {'label': 'f', 'value': 'f'},
                {'label': 'nf', 'value': 'nf'},
                {'label': 'm', 'value': 'm'},
                {'label': 'r', 'value': 'r'},
                {'label': 'd', 'value': 'd'},
            ],
            condition: '',
        };
    },
    mounted: function(){
        this.condition = this.catalog.condition || '';
    },
    methods:{
        close(){
            this.$emit('close', false);
        },
        saveData(){
            if(this.catalog.condition == this.condition){
                // return ADS.message('相同谱目状态不建议修改！');
            }
            this.updateCondition();
        },
        async updateCondition(){// 编辑谱目状态
            let data = await api.patchAxios('v3/review/updateCondition',{
                'gcKey': this.catalog._key, 
                'condition': this.condition,
                'userKey': this.userId, 
                'siteKey': this.stationKey
            });

            if(data.status == 200){
                this.$emit('save', this.condition);
            }else{
                ADS.message(data.msg);
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
        
    }
};
</script>

<style scoped lang="scss">
.condition-wrap{
    position: fixed;
    top: 40px;
    right: 450px;
    background: #fff;
    font-size: 14px;
    color: #000;
    box-shadow: 0 0 1px 1px #ddd;
    z-index: 1000;
    padding: 10px 20px;
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
        width: 100%;
    }
    .foot-box{
        position: relative;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
.condition-box{
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .label{
        width: 120px;
        text-align: right;
        margin-right: 10px;
    }
}
</style>

