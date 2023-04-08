<template>
    <div class="org-module-wrap">
        <div class="org-module-box">
            <h3 class="title">申请加入机构</h3>
            <div class="org-content" v-if="isOrg == 1">
                <vxe-select v-model="orgKey" placeholder="请选择机构">
                    <vxe-option v-for="(item,index) in orgList" :key="index" :value="item.value" :label="item.label"></vxe-option>
                </vxe-select>
            </div>
            <div class="org-content" v-if="isOrg == 2">您的机构加入申请已提交，请等待管理员审核</div>
            <div class="org-foot">
                <button class="btn" @click="close">返回</button>
                <button v-if="isOrg == 1" class="btn active" @click="save">申请</button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import api from "../../api.js";
import ADS from "../../ADS.js";
export default {
    name: "orgModule",
    props:{
        isOrg: {
            type: Number,
            default: 1,
        }
    },
    components: {
    
    },
    data: () => {
        return {
            orgList: [],
            orgKey: '',
        };
    },
    mounted:function(){
        this.getOrgList();
    },
    methods:{
        getOrgList:async function(){
            let result = await api.getAxios('org?siteKey='+this.stationKey);
            if(result.status == 200){
                this.orgList = result.data.map((ele) => {
                    return {'label': ele.name, 'value': ele._key};
                });
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' })
            }
        },
        async applyJoinOrg(){
            let result = await api.postAxios('applyJoinOrg', {'orgKey': this.orgKey, 'userKey': this.userId, 'siteKey': this.stationKey});
            if(result.status == 200){
                this.$XModal.message({ message: '已提交申请，请耐心等待', status: 'sucess' });
                this.close();
            }else{
                this.$XModal.message({ message: result.msg, status: 'warning' });
            }
        },
        save(){
            if(!this.orgKey){
                this.$XModal.message({ message: '请选择机构', status: 'warning' });
            }else{
                this.applyJoinOrg();
            }
        },
        close(){
            this.$emit('close', 3);
        },
    },
    computed: {
        ...mapState({
           stationKey: state => state.nav.stationKey,
           userId: state => state.nav.userId,
        })
    },
};
</script>
<style scoped lang="scss">
.org-module-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.org-module-box{
    position: relative;
    background: #fff;
    border-radius: 10px;
    padding: 40px 100px;
    .title{
        text-align: center;
        margin-bottom: 20px;
    }
    .org-foot{
        margin-top: 20px;
        display: flex;
        justify-content: center;
        .btn{
            width: 120px;
            height: 40px;
            line-height: 40px;
            border: 1px solid #ddd;
            cursor: pointer;
            outline: none;
            border-radius: 5px;
            font-size: 16px;
            &.active{
                background: #358acd;
                color: #fff;
                border: none;
                margin-left: 20px;
            }
        }
    }
}
</style>

