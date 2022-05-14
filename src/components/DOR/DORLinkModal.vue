<template>
    <div class="dor-link-wrap">
        <div class="dor-link-box">
            <div class="dor-link-title-wrap">
                <a :href="'https://cdn-icare.qingtime.cn/'+name" target="_blank">{{name.substr(name.indexOf('_')+1)}}</a>
                <i class="vxe-icon--close" @click="close"></i>
            </div>
            <div class="dor-link-toolbar">
                <input class="dor-link-input" type="text" v-model="batch" placeholder="请输入批次号" @keyup.enter="getBatchList" />
                <vxe-button status="primary" content="检索" @click="getBatchList"></vxe-button>
                <vxe-button status="primary" content="关联" @click="bindDor"></vxe-button>
            </div>
            <div class="dor-link-content">
                <ul class="dor-link-batch">
                    <li :class="{active:checkBatch == item._key}" v-for="(item,index) in batchs" :key="'batch'+index" @click="checkBatchHandle(item._key)">{{item.batchID}}{{checkBatch == item._key ? ' √' : ''}}</li>
                </ul>
                <ul class="dor-link-batch dor-link-jiapu">
                    <li :class="{active:checkJiapu.indexOf(item._key) > -1}" v-for="(item,index) in jiapus" :key="'jiapu'+index" @click="checkJiapuHandle(item._key)">{{item.genealogyName}}({{item._key}}){{checkJiapu.indexOf(item._key) > -1 ? ' √' : ''}}</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import api from "../../api.js";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
    name: "uploadDOR",
    props:{
        name: {
            type: String,
        },
        dorKey:{
            type : String,
        }
    },
    data: () => {
        return {
            siteKey: '',
            batch:'',
            checkBatch: '',
            batchs: [],
            checkJiapu:[],
            jiapus: [],
        };
    },
    mounted:function(){
        this.stationKey == '1379194999' ? '' : this.siteKey = this.stationKey;
        this.getBatchList();
    },
    methods:{
        close(flag = false){
            this.$emit('close-link', flag);
        },
        checkBatchHandle(batch){
            this.checkBatch = batch;
            this.getDataCheckLog();
        },
        checkJiapuHandle(id){
            let i = this.checkJiapu.indexOf(id);
            if(i > -1){
                this.checkJiapu.splice(i,1);
            }else{
                this.checkJiapu.push(id);
            }
        },
        bindDor:async function(){
            let data=await api.postAxios('data/bindDor',{'dorKey':this.dorKey,'batchKey': this.checkBatch,'dataArr': this.checkJiapu});
            if(data.status == 200){
                this.$XModal.message({ message: 'dor关联成功', status: 'success' });
                this.close(true);
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' });
            }
        },
        getBatchList:async function(){// 批次号列表
            let data=await api.getAxios('batch/simple?siteKey='+this.stationKey+'&keyWord='+this.batch);
            if(data.status == 200){
                this.batchs = data.data;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
        getDataCheckLog:async function(){// 批次列表谱目
            let data = await api.getAxios('data/bindDor?batchKey='+this.checkBatch+'&dorKey='+this.dorKey);
            if(data.status == 200){
                let checkJiapu = [];
                this.jiapus = data.data;
                this.jiapus.map((item)=>{
                    if(item.dorBind){
                        checkJiapu.push(item._key);
                    }
                });
                this.checkJiapu = checkJiapu;
            }else{
                this.$XModal.message({ message: data.msg, status: 'warning' })
            }
        },
    },
    computed: {
        ...mapState({
            TOKEN: state => state.nav.TOKEN,
            userId: state => state.nav.userId,
            stationKey: state => state.nav.stationKey,
        })
    },
};
</script>
<style scoped lang="scss">
.dor-link-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    .dor-link-box{
        background-color: #fff;
        border-radius: 10px;
        padding: 20px;
    }
}
.dor-link-title-wrap{
    position: relative;
    height: 40px;
    line-height: 40px;
    margin-bottom: 20px;
    a{
        color: #458acd;
        text-align: center;
        display: block;
    }
    i{
        position: absolute;
        top: 10px;
        right: 0;
        font-size: 20px;
        cursor: pointer;
    }
}
.dor-link-toolbar{
    display: flex;
    height: 40px;
    .dor-link-input{
        width: 200px;
        height: 32px;
        line-height: 34px;
        border: 1px solid #ddd;
        outline: none;
        border-radius: 5px;
        text-indent: 10px;
        margin-right: 10px;
    }
}
.dor-link-content{
    width: 100%;
    height: 400px;
    display: flex;
    background-color: #f1f1f1;
    .dor-link-batch{
        width: 160px;
        height: 100%;
        overflow-y: auto;
        li{
            height: 30px;
            line-height: 30px;
            text-indent: 10px;
            cursor: pointer;
            &.active{
                color: #358acd;
            }
        }
    }
    .dor-link-jiapu{
        width: 300px;
        margin-left: 10px;
        border-left: 1px solid #ddd;
    }
}
</style>

